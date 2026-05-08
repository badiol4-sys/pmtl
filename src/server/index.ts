import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { D1Database } from '@cloudflare/workers-types';
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import uploadsRoutes from './routes/uploads';
import messagesRoutes from './routes/messages';
import teacherRoutes from './routes/teacher';
import parentRoutes from './routes/parent';
import pdfUploadRoutes from './routes/pdf-upload';
import classesRoutes from './routes/classes';
import behaviorNotesRoutes from './routes/behavior-notes';

interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  CLAUDE_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());
app.use('*', async (c, next) => {
  c.header('Content-Type', 'application/json');
  await next();
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/children', childrenRoutes);
app.route('/api/uploads', uploadsRoutes);
app.route('/api/messages', messagesRoutes);
app.route('/api/teacher', teacherRoutes);
app.route('/api/parent', parentRoutes);
app.route('/api/pdf', pdfUploadRoutes);
app.route('/api/classes', classesRoutes);
app.route('/api/notes', behaviorNotesRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
