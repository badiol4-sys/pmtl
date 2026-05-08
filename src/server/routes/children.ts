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
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, { status: 401 });
  }
}

router.use('*', verifyToken);

// Get all children (for animator/director)
router.get('/', async (c) => {
  const user = c.get('user');

  if (!['animator', 'director', 'alsh'].includes(user.role)) {
    return c.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = c.env.DB;
    const children = await db
      .prepare(`
        SELECT c.*, cl.name as class_name
        FROM children c
        JOIN classes cl ON c.class_id = cl.id
        ORDER BY c.last_name, c.first_name
      `)
      .all();

    return c.json(children.results || []);
  } catch (error) {
    console.error('Error fetching children:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});



// Get child details with uploads and notes
router.get('/:childId', async (c) => {
  const { childId } = c.req.param();
  const user = c.get('user');

  try {
    const db = c.env.DB;

    // Verify access
    if (user.role === 'parent') {
      const parentChild = await db
        .prepare('SELECT * FROM parent_children WHERE child_id = ? AND parent_id = ?')
        .bind(childId, user.userId)
        .first();

      if (!parentChild) {
        return c.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const child = await db
      .prepare('SELECT * FROM children WHERE id = ?')
      .bind(childId)
      .first();

    if (!child) {
      return c.json({ error: 'Not found' }, { status: 404 });
    }

    return c.json(child);
  } catch (error) {
    console.error('Error fetching child:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
