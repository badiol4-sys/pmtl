import { Hono } from 'hono';
import { verify } from 'hono/jwt';

interface Env {
  DB: any;
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
    if (decoded.role !== 'parent') {
      return c.json({ error: 'Forbidden' }, { status: 403 });
    }
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, { status: 401 });
  }
}

router.use('*', verifyToken);

// Get parent's children
router.get('/children', async (c) => {
  const user = c.get('user');

  try {
    const db = c.env.DB;
    const children = await db
      .prepare(`
        SELECT c.*, cl.name as class_name
        FROM children c
        JOIN classes cl ON c.class_id = cl.id
        JOIN parent_children pc ON c.id = pc.child_id
        WHERE pc.parent_id = ?
        ORDER BY c.last_name, c.first_name
      `)
      .bind(user.userId)
      .all();

    return c.json(children.results || []);
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Get uploads for a specific child
router.get('/child/:childId/uploads', async (c) => {
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

// Get behavior notes for a child
router.get('/child/:childId/notes', async (c) => {
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

    // Get notes
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
    console.error('Error fetching notes:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
