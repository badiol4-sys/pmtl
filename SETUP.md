# Setup Guide - Tony Lainé App

## Requirements

- Node.js 18+ / Bun 1.0+
- Cloudflare Account (Workers, D1, R2)
- Claude API Key (anthropic.com)

## Local Development

### 1. Install Dependencies
```bash
bun install
# ou
npm install
```

### 2. Environment Variables

Créer `.env.local`:
```env
CLAUDE_API_KEY=sk-ant-...
JWT_SECRET=your-super-secret-key-change-this
```

### 3. Run Development Server
```bash
bun dev --port 4629
# Server available at http://localhost:4629
```

### 4. Database (Local Development)

D1 est déjà configuré pour local. Pour charger le schema:

```bash
wrangler d1 execute tony-laine-app --file schema.sql --local
```

## Configuration Cloudflare (Before Production)

### 1. Create D1 Database

```bash
# Create database
wrangler d1 create tony-laine-app

# Copy database_id and add to wrangler.json
```

### 2. Load Schema

```bash
# Run migrations
wrangler d1 execute tony-laine-app --file schema.sql
```

### 3. Create R2 Bucket

```bash
# Create bucket
wrangler r2 bucket create tony-laine-app-uploads

# Configure CORS (via Cloudflare Dashboard):
# Allowed Origins: https://your-domain.com, http://localhost:4629
# Allowed Methods: GET, PUT, POST
# Allowed Headers: Content-Type
```

### 4. Set Secrets

```bash
# Claude API Key
wrangler secret put CLAUDE_API_KEY

# JWT Secret (generate random)
wrangler secret put JWT_SECRET
```

### 5. Update wrangler.json

```json
{
  "name": "tony-laine-app",
  "type": "webpack",
  "main": "src/server/index.ts",
  "compatibility_date": "2024-01-01",
  "env": {
    "production": {
      "route": "https://school.example.com/*",
      "zone_id": "YOUR_ZONE_ID"
    }
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "tony-laine-app",
      "database_id": "YOUR_DB_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2_BUCKET",
      "bucket_name": "tony-laine-app-uploads"
    }
  ]
}
```

### 6. Deploy

```bash
wrangler publish
```

## Initial Data Setup

### Create Test Users

Connect to D1 and run:

```sql
-- Animator
INSERT INTO users (id, email, password_hash, role, first_name, last_name)
VALUES (
  'anim-1',
  'animator@tonylaine.fr',
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- SHA256 of 'password'
  'animator',
  'Marie',
  'Dubois'
);

-- Teacher
INSERT INTO users (id, email, password_hash, role, first_name, last_name)
VALUES (
  'prof-1',
  'marie@tonylaine.fr',
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  'teacher',
  'Marie',
  'Durand'
);

-- Parent
INSERT INTO users (id, phone, password_hash, role, first_name)
VALUES (
  'parent-1',
  '+33612345678',
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  'parent',
  'Jean'
);

-- Director
INSERT INTO users (id, email, password_hash, role, first_name, last_name)
VALUES (
  'dir-1',
  'directrice@tonylaine.fr',
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  'director',
  'Sandrine',
  'Martin'
);

-- Classes
INSERT INTO classes (id, name, type, teacher_id)
VALUES 
  ('class-cp', 'CP', 'class', 'prof-1'),
  ('class-ce1', 'CE1', 'class', 'prof-2'),
  ('pause-matin', 'Pause Méridienne A', 'pause_meridienne', null),
  ('alsh', 'ALSH', 'alsh', null);
```

## Common Issues

### "Claude API Error"
- ✅ Vérifier CLAUDE_API_KEY dans wrangler secret
- ✅ Vérifier quota API
- ✅ Vérifier format réponse Claude

### "Database not found"
- ✅ Vérifier database_id dans wrangler.json
- ✅ Vérifier binding "DB" dans server code
- ✅ Vérifier D1 créée dans le bon compte Cloudflare

### "R2 bucket error"
- ✅ Vérifier bucket existe
- ✅ Vérifier CORS settings
- ✅ Vérifier binding "R2_BUCKET" dans code

### "JWT invalid"
- ✅ Vérifier JWT_SECRET identique partout
- ✅ Vérifier token pas expiré
- ✅ Vérifier localStorage token pas corrompu

## Production Checklist

- [ ] Changer JWT_SECRET (très important!)
- [ ] Changer SHA256 → bcrypt pour passwords
- [ ] Ajouter rate limiting
- [ ] Configurer HTTPS
- [ ] Activer CORS restreint
- [ ] Setup monitoring (Cloudflare Analytics)
- [ ] Setup backups D1
- [ ] Tester tous les flux auth
- [ ] Tester PDF extraction
- [ ] Tester uploads R2
- [ ] Load testing
- [ ] Security audit

## Support

Pour questions:
- Code: Architecture.md
- Déploiement: SETUP.md (ce fichier)
- Features: task.md (TODO list)
- Design: design.md

Contacter: [votre email]
