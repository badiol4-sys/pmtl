import { Hono } from 'hono';
import { verify } from 'hono/jwt';

interface Env {
  DB: any;
  R2_BUCKET: any;
  CLAUDE_API_KEY: string;
}

const router = new Hono<{ Bindings: Env }>();

// Middleware to verify token (animator/director only)
async function verifyToken(c: any, next: any) {
  const auth = c.req.header('Authorization');
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = auth.replace('Bearer ', '');
  try {
    const decoded = await verify(token, 'your-secret-key-change-this');
    if (!['animator', 'director', 'alsh'].includes(decoded.role)) {
      return c.json({ error: 'Forbidden' }, { status: 403 });
    }
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, { status: 401 });
  }
}

router.use('*', verifyToken);

// Extract text from PDF using Claude Vision
async function extractChildrenFromPDF(
  pdfBuffer: ArrayBuffer,
  fileName: string,
  claudeKey: string
): Promise<Array<{ name: string; phone: string }>> {
  // Convert PDF to base64 for Claude API
  const base64 = Buffer.from(pdfBuffer).toString('base64');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extrait de ce document PDF la liste des enfants avec leur numéro de téléphone parent.
                Retourne UNIQUEMENT un JSON valide sans texte supplémentaire, au format:
                [
                  {"name": "Prénom Nom", "phone": "+33..."},
                  ...
                ]
                Si le numéro de téléphone n'est pas trouvé, utilise une chaîne vide "".
                Le nom doit être "Prénom Nom" (complet).`,
              },
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const content = data.content[0].text;

    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return extracted;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract children from PDF');
  }
}

// Upload PDF and extract children
router.post('/upload-class-list', async (c) => {
  const user = c.get('user');
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const classId = formData.get('classId') as string;

  if (!file || !classId) {
    return c.json(
      { error: 'Missing file or classId' },
      { status: 400 }
    );
  }

  try {
    const db = c.env.DB;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Extract children using Claude
    const extractedChildren = await extractChildrenFromPDF(
      buffer,
      file.name,
      c.env.CLAUDE_API_KEY
    );

    // Store PDF in R2
    const bucket = c.env.R2_BUCKET;
    const pdfPath = `pdfs/class-lists/${classId}/${Date.now()}-${file.name}`;
    await bucket.put(pdfPath, buffer, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
    });

    // Create children and parent relationships
    const pdfUploadId = crypto.randomUUID();
    let createdCount = 0;
    const parentPhoneMap: Record<string, string> = {}; // phone -> parent_code

    for (const childData of extractedChildren) {
      if (!childData.name || childData.name.trim() === '') {
        continue;
      }

      try {
        const [firstName, ...lastNameParts] = childData.name.split(' ');
        const lastName = lastNameParts.join(' ') || 'N/A';
        const phone = childData.phone?.trim() || '';

        // Generate parent code from phone (dedup by phone)
        let parentCode = phone;
        if (phone) {
          if (!parentPhoneMap[phone]) {
            parentPhoneMap[phone] = phone; // Use phone as parent code
          }
          parentCode = parentPhoneMap[phone];
        } else {
          // Generate unique code if no phone
          parentCode = `CODE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        const childId = crypto.randomUUID();

        // Insert child
        await db
          .prepare(`
            INSERT INTO children (id, first_name, last_name, class_id, parent_code, phone_parent)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          .bind(childId, firstName, lastName, classId, parentCode, phone || null)
          .run();

        createdCount++;
      } catch (childError) {
        console.error(`Error creating child ${childData.name}:`, childError);
        // Continue with next child
      }
    }

    // Record PDF upload
    await db
      .prepare(`
        INSERT INTO pdf_uploads (id, animator_id, class_id, file_path, children_extracted, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(pdfUploadId, user.userId, classId, pdfPath, createdCount, 'completed')
      .run();

    return c.json({
      success: true,
      childrenCreated: createdCount,
      pdfPath,
      message: `${createdCount} enfants créés à partir du PDF`,
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'PDF upload failed',
      },
      { status: 500 }
    );
  }
});

export default router;
