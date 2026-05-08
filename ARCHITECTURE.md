# Architecture - Tony Lainé App

## Vue d'ensemble

Application web full-stack pour gérer l'école Tony Lainé. Connecte animateurs, enseignants et parents pour un suivi complet des enfants.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React + Vite)                    │
├─────────────────────────────────────────────────────────────┤
│ Pages:                                                      │
│ • Login (multi-role)                                        │
│ • Dashboard Animator (enfants, uploads, notes)              │
│ • Dashboard Teacher (élèves, uploads créations)             │
│ • Dashboard Parent (enfants, créations, messages)           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP + WebSockets
                         │
┌────────────────────────▼────────────────────────────────────┐
│          Backend (Hono + Cloudflare Workers)                │
├─────────────────────────────────────────────────────────────┤
│ Routes:                                                     │
│ • /api/auth         (login, parent-login)                   │
│ • /api/children     (CRUD enfants)                          │
│ • /api/teacher      (enfants d'un enseignant)               │
│ • /api/parent       (enfants d'un parent)                   │
│ • /api/uploads      (créations, fichiers)                   │
│ • /api/messages     (messagerie)                            │
│ • /api/pdf          (upload + extraction IA)                │
│ • /api/classes      (gestion classes)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼───┐      ┌────▼────┐   ┌────▼─────┐
    │   D1   │      │    R2   │   │ Claude   │
    │ SQLite │      │ Storage │   │  API     │
    └────────┘      └─────────┘   └──────────┘
```

## Stack Technique

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + custom CSS
- **UI**: Lucide React icons
- **Routing**: React Router v6
- **State**: React Hooks + localStorage

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Auth**: JWT
- **AI**: Claude 3.5 Sonnet (PDF extraction)

### Infrastructure
- **Hosting**: Cloudflare (managed, auto-deploy)
- **Database**: D1 (SQLite via Cloudflare)
- **Storage**: R2 (compatible S3)
- **CORS**: Configuré pour multi-origin

## Flux Authentification

### Animateur/Director/ALSH
1. Email + password
2. Backend cherche user avec role
3. Valide password (SHA256)
4. Retourne JWT + userId + role
5. Frontend stocke localStorage

### Enseignant (3 étapes)
1. Étape 1: Code général (TL2026)
2. Étape 2: Prénom (retrouve enseignant)
3. Étape 3: Password personnel
4. Backend valide prénom + password
5. Retourne JWT

### Parent
1. Téléphone OU email + password
2. Backend cherche parent_code par phone
3. Valide password
4. Retourne JWT + parent_codes
5. Frontend limite accès aux enfants du parent

## Base de Données

### Tables principales
- **users**: Tous les utilisateurs (multi-role)
- **children**: Les enfants
- **classes**: Les classes/groupes
- **parent_children**: Relation parent-enfants (déduplication par phone)
- **uploads**: Créations (dessins, photos, travaux)
- **behavior_notes**: Notes de comportement par animateur
- **messages**: Messagerie écrite + audio
- **conversations**: Grouper messages entre deux personnes
- **notifications**: Notifications (in-app + push)
- **pdf_uploads**: Historique des imports PDF

### Clé: parent_code
- Généré à partir du téléphone parent
- Permet déduplication (2 enfants, même numéro = même parent)
- Utilisé pour filtrer données visibles

## Endpoints API

### Authentication
```
POST /api/auth/login
{
  identifier: "email",
  password: "...",
  role: "animator|teacher|director|alsh",
  firstName?: "..." (teacher only)
}
→ { token, userId, role, firstName }

POST /api/auth/parent-login
{
  identifier: "+33... ou email",
  password: "..."
}
→ { token, userId, role }
```

### Children
```
GET /api/children              # Tous (animator/director)
GET /api/teacher/children      # Enfants du prof
GET /api/parent/children       # Enfants du parent
GET /api/children/:childId     # Détails + uploads + notes
```

### Uploads
```
POST /api/uploads/upload       # Uploader création
GET /api/parent/child/:childId/uploads  # Créations visibles au parent

POST /api/pdf/upload-class-list # Upload PDF + IA
```

### Messagerie
```
GET /api/messages/conversations
GET /api/messages/conversation/:conversationId
POST /api/messages/send        # Message texte
POST /api/messages/send-audio  # Message audio
```

## Flux: Upload PDF avec Extraction IA

1. Animateur upload PDF (liste classe)
2. Backend reçoit fichier
3. Claude Vision extrait colonnes (Élève, Tél Parent)
4. Parse JSON: `[{"name": "...", "phone": "..."}]`
5. Pour chaque enfant:
   - Crée child_id
   - Crée/retrouve parent_code (basé phone)
   - Insert en DB
6. Retrouve/crée relationship parent_children
7. Retourne succès + count

## Flux: Messagerie (écrite + audio)

### Message texte
1. Parent/Animator/Teacher envoie message
2. Backend crée/retrouve conversation
3. Insert message + notification
4. Frontend reçoit + affiche

### Message audio
1. Frontend enregistre audio (WebAPI)
2. Envoie blob audio à endpoint
3. Backend upload à R2
4. Claude transcrit automatiquement
5. Insert message + transcription
6. Notification au destinataire

## Sécurité

- **JWT**: Signé et vérifié chaque requête
- **Roles**: Vérifiés côté serveur (ne pas faire confiance au client)
- **Parent filtering**: Enfants visibles = parents_children.parent_id == user.id
- **File access**: URLs R2 directes (pas de relay)
- **Passwords**: SHA256 (changer en bcrypt pour prod)

⚠️ À faire avant production:
- Changer JWT secret (fichier dur-codé)
- Utiliser bcrypt au lieu de SHA256
- Ajouter rate limiting (bruteforce)
- HTTPS obligatoire
- CORS restreint au domaine

## Déploiement

### Setup initial
```bash
# 1. Initialiser D1
wrangler d1 create tony-laine-app

# 2. Charger schema
wrangler d1 execute tony-laine-app --file schema.sql

# 3. Créer R2 bucket
wrangler r2 bucket create tony-laine-app-uploads

# 4. Variables d'env
wrangler secret put CLAUDE_API_KEY
wrangler secret put JWT_SECRET
```

### Deploy
```bash
wrangler deploy
```

### Preview local
```bash
bun dev --port 4629
```

## Next Steps - Priorités

### Phase 2 (Crítica)
- [ ] Audio recording API pour messages
- [ ] Transcription audio (Claude)
- [ ] Notification système (in-app toast)
- [ ] WebSockets pour messagerie temps réel
- [ ] Tests d'authentification

### Phase 3 (Important)
- [ ] Admin dashboard (stats, exports)
- [ ] Gestion utilisateurs (créer, modifier, supprimer)
- [ ] Pagination pour listes volumineuses
- [ ] Recherche/filtrage enfants
- [ ] Export PDF/CSV

### Phase 4 (Nice)
- [ ] Mobile app (React Native)
- [ ] Calendar/timeline
- [ ] Galerie photos
- [ ] Push notifications
- [ ] Intégration email

## Debugging

### Logs serveur
```bash
tmux capture-pane -t port_4629 -p
```

### Logs client
Browser DevTools → Console

### Vérifier API
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:4629/api/health
```

### DB queries
D1 browser (Cloudflare dashboard) après deploy
