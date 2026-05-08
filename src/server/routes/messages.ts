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

// Get conversations for user
router.get('/conversations', async (c) => {
  const user = c.get('user');

  try {
    const db = c.env.DB;
    const conversations = await db
      .prepare(`
        SELECT c.*, 
          u1.first_name as user1_name, u1.role as user1_role,
          u2.first_name as user2_name, u2.role as user2_role,
          (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
        FROM conversations c
        JOIN users u1 ON c.user1_id = u1.id
        JOIN users u2 ON c.user2_id = u2.id
        WHERE c.user1_id = ? OR c.user2_id = ?
        ORDER BY last_message_at DESC
      `)
      .bind(user.userId, user.userId)
      .all();

    return c.json(conversations.results || []);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Get messages in a conversation
router.get('/conversation/:conversationId', async (c) => {
  const { conversationId } = c.req.param();
  const user = c.get('user');

  try {
    const db = c.env.DB;

    // Verify user is part of this conversation
    const conversation = await db
      .prepare(
        'SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)'
      )
      .bind(conversationId, user.userId, user.userId)
      .first();

    if (!conversation) {
      return c.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messages = await db
      .prepare(`
        SELECT m.*, 
          u.first_name, u.last_name, u.role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
      `)
      .bind(conversationId)
      .all();

    // Mark as read
    await db
      .prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND receiver_id = ?')
      .bind(conversationId, user.userId)
      .run();

    return c.json(messages.results || []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

// Send text message
router.post('/send', async (c) => {
  const user = c.get('user');
  const { receiverId, conversationId, message } = await c.req.json();

  try {
    const db = c.env.DB;
    const messageId = crypto.randomUUID();

    // Create conversation if doesn't exist
    let convId = conversationId;
    if (!convId) {
      const existingConv = await db
        .prepare(
          `SELECT id FROM conversations 
           WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
          `
        )
        .bind(user.userId, receiverId, receiverId, user.userId)
        .first();

      if (existingConv) {
        convId = existingConv.id;
      } else {
        convId = crypto.randomUUID();
        await db
          .prepare(`
            INSERT INTO conversations (id, user1_id, user2_id, type)
            VALUES (?, ?, ?, ?)
          `)
          .bind(convId, user.userId, receiverId, 'text')
          .run();
      }
    }

    // Insert message
    await db
      .prepare(`
        INSERT INTO messages (id, sender_id, receiver_id, conversation_id, message_type, content)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(messageId, user.userId, receiverId, convId, 'text', message)
      .run();

    // Create notification
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, related_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        receiverId,
        'message',
        'Nouveau message',
        message.substring(0, 100),
        messageId
      )
      .run();

    return c.json({ id: messageId, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Server error' }, { status: 500 });
  }
});

export default router;
