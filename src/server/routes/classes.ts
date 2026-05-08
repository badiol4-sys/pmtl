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

// Get all classes (for animator/director)
router.get('/', async (c) => {
  const user = c.get('user');

  if (!['animator', 'director', 'alsh'].includes(user.role)) {
    return c.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = c.env.DB;
    const classes = await db
      .prepare(`
        SELECT id, name, type
        FROM classes
        ORDER BY name
      `)
      .all();

    return c.json(classes.results || []);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
