# Tony Lainé App - Build Progress

## Architecture
- React + Vite frontend
- Hono + Cloudflare Workers backend
- D1 SQLite database
- R2 file storage
- Multi-role auth (animator, teacher, parent, director, alsh)

## Completed ✅
1. [x] Design guidelines (design.md)
2. [x] Database schema (schema.sql)
3. [x] Authentication routes (login, parent-login, teacher 3-step)
4. [x] Children API routes (all roles)
5. [x] Messages API (basic CRUD)
6. [x] Uploads API (file upload to R2)
7. [x] Teacher routes
8. [x] Parent routes
9. [x] Classes API routes
10. [x] PDF upload + Claude AI extraction routes
11. [x] React pages:
   - [x] Login page (multi-role)
   - [x] Dashboard Animator
   - [x] Dashboard Teacher
   - [x] Dashboard Parent
   - [x] Animator PDF upload page
12. [x] ProtectedRoute component
13. [x] App router setup
14. [x] UI Components:
   - [x] FileUploadZone (drag-drop)
   - [x] MessageBox (text + audio)
15. [x] Documentation:
   - [x] ARCHITECTURE.md (tech details)
   - [x] SETUP.md (deployment guide)
   - [x] ONBOARDING.md (user guides)
16. [x] Build verification (no TypeScript errors)

## TODO - Priority 1 (Critical)
- [x] Fix imports in children.ts routes (removed duplicates)
- [x] Create API route for PDF upload + AI extraction (Claude)
- [x] Create messaging UI component (MessageBox)
- [x] Add file upload UI (FileUploadZone with drag-drop)
- [ ] Implement behavior notes creation endpoint
- [ ] Implement behavior notes UI (animator dashboard)
- [ ] Test authentication flow end-to-end (all 3 flows)
- [ ] Setup D1 database + load schema.sql
- [ ] Test PDF extraction with actual Claude API
- [ ] Test file uploads to R2

## TODO - Priority 2 (Important)
- [ ] Audio recording + transcription for messages
- [ ] Notification system (in-app + push)
- [ ] Search/filter for children, messages
- [ ] Pagination for large datasets
- [ ] User profile edit pages
- [ ] Password reset flow
- [ ] Admin dashboard (director/alsh)

## TODO - Priority 3 (Nice to Have)
- [ ] Export reports (PDF, CSV)
- [ ] Calendar/timeline for events
- [ ] Photo gallery for children
- [ ] Real-time collaboration (socket.io)
- [ ] Email notifications
- [ ] Mobile app (React Native)

## Key Decisions Made
1. Parent login: phone OR email (flexible)
2. Teacher login: 3-step (general pass → name → personal pass)
3. Parent codes: auto-generated from phone number for deduplication
4. File storage: R2 (Cloudflare)
5. AI extraction: Claude API for PDF parsing
6. Real-time: WebSockets for messaging

## Current Issues
- [ ] Children routes have duplicates (parent/children endpoint exists in both children.ts and parent.ts)
- [ ] Need to standardize route prefixes
- [ ] JWT secret is hardcoded (change to env var)

## Testing Checklist
- [ ] Login flow (animator)
- [ ] Login flow (teacher - 3 steps)
- [ ] Login flow (parent)
- [ ] View children list (animator)
- [ ] View own children (parent)
- [ ] Upload file (animator/teacher)
- [ ] View uploads (parent)
- [ ] Send message
- [ ] Receive notification

## Deployment Notes
- Database: Create D1 database from schema.sql
- R2: Setup bucket with CORS for file uploads
- Env vars: Set CLAUDE_API_KEY, JWT secret, R2 credentials
- Preview: `tmux capture-pane -t port_4629 -p` to check logs
