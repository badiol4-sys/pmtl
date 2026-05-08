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
    if (decoded.role !== 'teacher') {
      return c.json({ error: 'Forbidden' }, { status: 403 });
    }
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, { status: 401 });
  }
}

router.use('*', verifyToken);

// Get teacher's children
router.get('/children', async (c) => {
  const user = c.get('user');

  try {
    const db = c.env.DB;
    const children = await db
      .prepare(`
        SELECT c.*, cl.name as class_name
        FROM children c
        JOIN classes cl ON c.class_id = cl.id
        WHERE cl.teacher_id = ?
        ORDER BY c.last_name, c.first_name
      `)
      .bind(user.userId)
      .all();

    return c.json(children.results || []);
  } catch (error) {
    console.error('Error fetching teacher children:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
