import { Hono } from 'hono';
import { sha256 } from 'js-sha256';
import { sign } from 'hono/jwt';
import { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

const router = new Hono<{ Bindings: Env }>();

// Helper function to hash password
function hashPassword(password: string): string {
  return sha256(password);
}

// Helper function to verify password
function verifyPassword(password: string, hash: string): boolean {
  return sha256(password) === hash;
}

// Animator/Teacher login
router.post('/login', async (c) => {
  const { identifier, password, role, firstName } = await c.req.json();

  try {
    const db = c.env.DB;
    let user;

    if (role === 'animator' || role === 'director' || role === 'alsh') {
      // Email-based login for staff
      const result = await db
        .prepare('SELECT * FROM users WHERE email = ? AND role = ?')
        .bind(identifier, role)
        .first();

      user = result;
    } else if (role === 'teacher') {
      // Teacher login: find by first name and verify password
      const result = await db
        .prepare('SELECT * FROM users WHERE first_name = ? AND role = ? AND password_hash IS NOT NULL')
        .bind(firstName, 'teacher')
        .first();

      user = result;
    }

    if (!user) {
      return c.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return c.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        firstName: user.first_name,
      },
      'your-secret-key-change-this'
    );

    return c.json({
      token,
      userId: user.id,
      role: user.role,
      firstName: user.first_name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
});

// Parent login (phone or email)
router.post('/parent-login', async (c) => {
  const { identifier, password } = await c.req.json();

  try {
    const db = c.env.DB;

    // Find parent by phone or email
    const user = await db
      .prepare(
        'SELECT * FROM users WHERE (phone = ? OR email = ?) AND role = ?'
      )
      .bind(identifier, identifier, 'parent')
      .first();

    if (!user) {
      return c.json(
        { error: 'Téléphone/email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return c.json(
        { error: 'Téléphone/email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Get parent's children
    const children = await db
      .prepare(`
        SELECT c.parent_code
        FROM children c
        WHERE c.parent_code IN (
          SELECT DISTINCT parent_code FROM children
          WHERE parent_code IN (
            SELECT parent_code FROM parent_children WHERE parent_id = ?
          )
        )
      `)
      .bind(user.id)
      .all();

    // Generate JWT token
    const token = await sign(
      {
        userId: user.id,
        role: 'parent',
        phone: user.phone,
        parentCode: children[0]?.parent_code,
      },
      'your-secret-key-change-this'
    );

    return c.json({
      token,
      userId: user.id,
      role: 'parent',
    });
  } catch (error) {
    console.error('Parent login error:', error);
    return c.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
});

export default router;
