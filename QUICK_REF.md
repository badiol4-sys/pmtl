# Quick Reference Card

## Start Development
```bash
cd tony-laine-app
bun install
bun dev --port 4629
# Visit: http://localhost:4629
```

## Stop Dev Server
```bash
tmux kill-session -t port_4629
```

## Restart Dev Server
```bash
cd tony-laine-app && tmux kill-session -t port_4629 && \
tmux new -d -s port_4629 'bun dev --port 4629'
```

## Check Server Status
```bash
tmux capture-pane -t port_4629 -p
```

## Build for Production
```bash
npm run build
# Output: dist/
```

---

## Project Structure

```
src/
├── pages/              # React pages (login, dashboards)
├── components/         # Reusable UI components
├── server/            # Backend API (Hono)
│   └── routes/        # API endpoints
└── App.tsx            # Router setup

schema.sql            # Database structure
design.md             # UI/UX guidelines
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/server/index.ts` | Main API server |
| `src/server/routes/auth.ts` | Login logic |
| `src/server/routes/pdf-upload.ts` | PDF + AI |
| `schema.sql` | Database |
| `design.md` | Colors, fonts, style |
| `wrangler.json` | Cloudflare config |

---

## Common Tasks

### Add New API Endpoint
1. Create file in `src/server/routes/`
2. Export router with `Hono` instance
3. Add route to `src/server/index.ts`
4. Implement middleware (auth check)

### Add New Page
1. Create in `src/pages/pagename.tsx`
2. Import in `src/App.tsx`
3. Add route in `<Routes>`
4. Add protection if needed with `<ProtectedRoute>`

### Add UI Component
1. Create in `src/components/ComponentName.tsx`
2. Use Tailwind + Lucide icons
3. Export as default
4. Import where needed

### Test Authentication
```bash
# In browser console:
localStorage.setItem('auth_token', 'test-token')
localStorage.setItem('user_role', 'animator')
# Then refresh
```

---

## Database (Cloudflare D1)

### Load Schema (local)
```bash
wrangler d1 execute tony-laine-app --file schema.sql --local
```

### Query (local dev)
```bash
# Uses SQLite locally, accessible via queries in API
```

### Deploy to Production
```bash
# Setup database first
wrangler d1 create tony-laine-app

# Load schema
wrangler d1 execute tony-laine-app --file schema.sql
```

---

## Environment Variables

Required in `.env.local`:
```env
CLAUDE_API_KEY=sk-ant-xxxxx
JWT_SECRET=your-secret-key-min-32-chars
```

---

## Testing Logins

After adding test users to DB:

| User Type | Email/Phone | Password | Code |
|-----------|-------------|----------|------|
| Animator | animator@tonylaine.fr | password | - |
| Teacher | (via prefname) | password | TL2026 |
| Parent | +33612345678 | password | - |
| Director | director@tonylaine.fr | password | - |

Teacher flow: Code → Name → Password

---

## Important URLs

| Resource | URL |
|----------|-----|
| Live Preview | http://localhost:4629 |
| API Health | http://localhost:4629/api/health |
| Vite Debug | http://localhost:4629/__debug |

---

## Common Issues & Fixes

**Server won't start?**
```bash
# Kill existing session and restart
tmux kill-session -t port_4629
cd tony-laine-app && bun dev --port 4629
```

**TypeScript errors?**
```bash
bun install  # Update dependencies
npm run build  # Check for real errors
```

**Database not found?**
```bash
# Make sure schema loaded
wrangler d1 execute tony-laine-app --file schema.sql --local
```

**Port 4629 already in use?**
```bash
# Change port in command:
bun dev --port 5000
```

---

## Git Workflow

```bash
# Add changes
git add .

# Commit
git commit -m "feat: add behavior notes"

# Push
git push origin main

# Deploy
wrangler deploy
```

---

## Before Production

- [ ] Change JWT_SECRET
- [ ] Switch to bcrypt for passwords
- [ ] Add rate limiting
- [ ] Setup monitoring
- [ ] Test all auth flows
- [ ] Load test (>200 users)
- [ ] Security audit
- [ ] Configure backups

---

## Key Numbers

| Item | Value |
|------|-------|
| Children | 280 |
| Animators | 13 |
| Teachers | 16 |
| Parents | 180 |
| Classes | ~10 |
| Files Bundle | 228KB (JS) |
| Build Time | <2s |
| API Response | <200ms |

---

## Documentation Files

```
PROJECT.md        ← Start here (overview)
ARCHITECTURE.md   ← Tech deep-dive
SETUP.md          ← Deployment guide
ONBOARDING.md     ← User guides
API_ENDPOINTS.md  ← All API routes
design.md         ← UI/UX system
schema.sql        ← Database
task.md           ← TODO list
DELIVERY.md       ← What's included
QUICK_REF.md      ← This file
```

---

## Quick Wins (Easy Improvements)

- [ ] Add "forgot password" flow
- [ ] Add teacher calendar view
- [ ] Add search bar for children
- [ ] Add pagination (tables)
- [ ] Add export to PDF
- [ ] Add mobile menu
- [ ] Add dark mode
- [ ] Add toast notifications

---

## Commands Reference

```bash
# Dev
bun dev --port 4629

# Build
npm run build

# Format
npx prettier --write .

# Type check
npx tsc --noEmit

# Database
wrangler d1 execute tony-laine-app --file schema.sql --local

# Deploy
wrangler deploy

# Install deps
bun install

# View logs
tmux capture-pane -t port_4629 -p

# Kill server
tmux kill-session -t port_4629
```

---

## API Quick Tests

```bash
# Login
curl -X POST http://localhost:4629/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"animator@tonylaine.fr","password":"password","role":"animator"}'

# Get children
curl http://localhost:4629/api/children \
  -H "Authorization: Bearer YOUR_TOKEN"

# Health check
curl http://localhost:4629/api/health
```

---

## Support

Need help? Check:
1. **SETUP.md** - Common issues section
2. **ARCHITECTURE.md** - Debugging section
3. **API_ENDPOINTS.md** - Endpoint reference
4. **task.md** - Known issues

---

**Tip:** Bookmark this file and the docs folder for quick access!

Last Updated: May 7, 2026
