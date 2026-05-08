import { Hono } from 'hono';
import { verify } from 'hono/jwt';

interface Env {
  DB: any;
  R2_BUCKET: any;
}

const router = new Hono<{ Bindings: Env }>();

// Middleware to verify token
async function verifyToken(c: any, next: any) {
  const auth = c.req.header('Authorization');
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = auth.replace('Bearer ', '');
  try {
    const decoded = await verify(token, 'your-secret-key-change-this');
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, { status: 401 });
  }
}

router.use('*', verifyToken);

// Get uploads for a child (for parents)
router.get('/parent/child/:childId/uploads', async (c) => {
  const { childId } = c.req.param();
  const user = c.get('user');

  try {
    const db = c.env.DB;

    // Verify parent has access to this child
    const parentChild = await db
      .prepare('SELECT * FROM parent_children WHERE child_id = ? AND parent_id = ?')
      .bind(childId, user.userId)
      .first();

    if (!parentChild) {
      return c.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get uploads
    const uploads = await db
      .prepare(`
        SELECT u.*, u2.first_name, u2.last_name
        FROM uploads u
        JOIN users u2 ON u.uploader_id = u2.id
        WHERE u.child_id = ?
        ORDER BY u.created_at DESC
      `)
      .bind(childId)
      .all();

    return c.json(uploads.results || []);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Upload a creation (animator or teacher)
router.post('/upload', async (c) => {
  const user = c.get('user');

  if (!['animator', 'teacher', 'director', 'alsh'].includes(user.role)) {
    return c.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const childId = formData.get('childId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !childId) {
      return c.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload to R2
    const bucket = c.env.R2_BUCKET;
    const fileName = `uploads/${childId}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    await bucket.put(fileName, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Save to database
    const db = c.env.DB;
    const uploadId = crypto.randomUUID();

    await db
      .prepare(`
        INSERT INTO uploads (id, child_id, uploader_id, uploader_role, file_path, file_type, title, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        uploadId,
        childId,
        user.userId,
        user.role,
        fileName,
        file.type,
        title || file.name,
        description || ''
      )
      .run();

    return c.json({
      id: uploadId,
      fileName,
      url: `https://r2.example.com/${fileName}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
