import { Hono } from 'hono';
import { verify } from 'hono/jwt';

interface Env {
  DB: any;
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

// Add behavior note
router.post('/add', async (c) => {
  const user = c.get('user');
  const { childId, note, category } = await c.req.json();

  if (!childId || !note) {
    return c.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['positive', 'neutral', 'concern'].includes(category)) {
    return c.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    const db = c.env.DB;
    const noteId = crypto.randomUUID();

    // Verify child exists
    const child = await db
      .prepare('SELECT id FROM children WHERE id = ?')
      .bind(childId)
      .first();

    if (!child) {
      return c.json({ error: 'Child not found' }, { status: 404 });
    }

    // Insert behavior note
    await db
      .prepare(`
        INSERT INTO behavior_notes (id, child_id, animator_id, note, category)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(noteId, childId, user.userId, note, category)
      .run();

    // Create notification for parents
    const parentChildren = await db
      .prepare(
        `SELECT DISTINCT parent_id FROM parent_children WHERE child_id = ?`
      )
      .bind(childId)
      .all();

    for (const parentChild of parentChildren.results || []) {
      await db
        .prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, related_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          crypto.randomUUID(),
          parentChild.parent_id,
          'behavior',
          'Nouvelle observation',
          `Une observation a été ajoutée pour votre enfant`,
          noteId
        )
        .run();
    }

    return c.json({
      id: noteId,
      success: true,
      message: 'Note enregistrée avec succès',
    });
  } catch (error) {
    console.error('Error adding behavior note:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Get behavior notes for a child (animator/parent can view)
router.get('/child/:childId', async (c) => {
  const { childId } = c.req.param();
  const user = c.get('user');

  try {
    const db = c.env.DB;

    // If parent, verify access
    if (user.role === 'parent') {
      const hasAccess = await db
        .prepare(
          `SELECT id FROM parent_children WHERE child_id = ? AND parent_id = ?`
        )
        .bind(childId, user.userId)
        .first();

      if (!hasAccess) {
        return c.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const notes = await db
      .prepare(`
        SELECT bn.*, u.first_name, u.last_name
        FROM behavior_notes bn
        JOIN users u ON bn.animator_id = u.id
        WHERE bn.child_id = ?
        ORDER BY bn.created_at DESC
      `)
      .bind(childId)
      .all();

    return c.json(notes.results || []);
  } catch (error) {
    console.error('Error fetching behavior notes:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Get all notes by animator
router.get('/animator/notes', async (c) => {
  const user = c.get('user');

  try {
    const db = c.env.DB;
    const notes = await db
      .prepare(`
        SELECT bn.*, c.first_name, c.last_name
        FROM behavior_notes bn
        JOIN children c ON bn.child_id = c.id
        WHERE bn.animator_id = ?
        ORDER BY bn.created_at DESC
        LIMIT 50
      `)
      .bind(user.userId)
      .all();

    return c.json(notes.results || []);
  } catch (error) {
    console.error('Error fetching animator notes:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Delete behavior note (animator only)
router.delete('/:noteId', async (c) => {
  const { noteId } = c.req.param();
  const user = c.get('user');

  try {
    const db = c.env.DB;

    // Verify ownership
    const note = await db
      .prepare('SELECT animator_id FROM behavior_notes WHERE id = ?')
      .bind(noteId)
      .first();

    if (!note) {
      return c.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.animator_id !== user.userId && user.role !== 'director') {
      return c.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete note
    await db
      .prepare('DELETE FROM behavior_notes WHERE id = ?')
      .bind(noteId)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
