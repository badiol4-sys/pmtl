# API Endpoints Reference

Base URL: `http://localhost:4629/api` (local) ou `https://your-domain.com/api` (production)

All endpoints require `Authorization: Bearer <JWT_TOKEN>` except login endpoints.

---

## Authentication

### POST `/auth/login`
Login for Animator, Director, ALSH, Teacher

```bash
curl -X POST http://localhost:4629/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "animator@tonylaine.fr",
    "password": "password",
    "role": "animator",
    "firstName": null
  }'
```

**Roles:** `animator` | `director` | `alsh` | `teacher`

**Response:**
```json
{
  "token": "eyJ...",
  "userId": "anim-1",
  "role": "animator",
  "firstName": "Marie"
}
```

---

### POST `/auth/parent-login`
Login for Parents

```bash
curl -X POST http://localhost:4629/api/auth/parent-login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+33612345678",
    "password": "password"
  }'
```

**Identifier:** Phone or Email

**Response:**
```json
{
  "token": "eyJ...",
  "userId": "parent-1",
  "role": "parent"
}
```

---

## Children Management

### GET `/children`
Get all children (Animator/Director only)

```bash
curl http://localhost:4629/api/children \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
[
  {
    "id": "child-1",
    "first_name": "Marie",
    "last_name": "Dupont",
    "class_id": "class-cp",
    "class_name": "CP",
    "parent_code": "+33612345678",
    "phone_parent": "+33612345678",
    "created_at": "2026-05-07T10:00:00Z"
  }
]
```

---

### GET `/child/:childId`
Get specific child details

```bash
curl http://localhost:4629/api/children/child-1 \
  -H "Authorization: Bearer TOKEN"
```

---

## Teacher Endpoints

### GET `/teacher/children`
Get children for a teacher (Teacher only)

```bash
curl http://localhost:4629/api/teacher/children \
  -H "Authorization: Bearer TOKEN"
```

---

## Parent Endpoints

### GET `/parent/children`
Get children for logged-in parent (Parent only)

```bash
curl http://localhost:4629/api/parent/children \
  -H "Authorization: Bearer TOKEN"
```

---

### GET `/parent/child/:childId/uploads`
Get uploads for a child (Parent only)

```bash
curl http://localhost:4629/api/parent/child/child-1/uploads \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
[
  {
    "id": "upload-1",
    "child_id": "child-1",
    "uploader_id": "anim-1",
    "uploader_role": "animator",
    "file_path": "uploads/child-1/123456-drawing.jpg",
    "title": "Dessin libre",
    "description": "Création du 7 mai 2026",
    "created_at": "2026-05-07T14:30:00Z",
    "first_name": "Marie",
    "last_name": "Dubois"
  }
]
```

---

### GET `/parent/child/:childId/notes`
Get behavior notes for a child (Parent only)

```bash
curl http://localhost:4629/api/parent/child/child-1/notes \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
[
  {
    "id": "note-1",
    "child_id": "child-1",
    "animator_id": "anim-1",
    "note": "Très coopératif, aidé un camarade",
    "category": "positive",
    "created_at": "2026-05-07T16:45:00Z",
    "first_name": "Marie",
    "last_name": "Dubois"
  }
]
```

---

## Classes

### GET `/classes`
Get all classes (Animator/Director)

```bash
curl http://localhost:4629/api/classes \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
[
  {
    "id": "class-cp",
    "name": "CP",
    "type": "class"
  },
  {
    "id": "pause-matin",
    "name": "Pause Méridienne A",
    "type": "pause_meridienne"
  }
]
```

---

## File Uploads

### POST `/uploads/upload`
Upload a creation (Animator/Teacher)

```bash
curl -X POST http://localhost:4629/api/uploads/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/file.jpg" \
  -F "childId=child-1" \
  -F "title=Dessin du jour" \
  -F "description=Libre expression"
```

**Response:**
```json
{
  "id": "upload-123",
  "fileName": "uploads/child-1/1715105400000-file.jpg",
  "url": "https://r2.example.com/uploads/child-1/1715105400000-file.jpg"
}
```

---

## PDF Import (with AI extraction)

### POST `/pdf/upload-class-list`
Upload class list PDF and extract children (Animator/Director)

```bash
curl -X POST http://localhost:4629/api/pdf/upload-class-list \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/class-list.pdf" \
  -F "classId=class-cp"
```

**PDF Format Expected:**
```
Élève                  Tél Parent
Marie Dupont          +33612345678
Pierre Bernard        +33687654321
```

**Response:**
```json
{
  "success": true,
  "childrenCreated": 25,
  "pdfPath": "pdfs/class-lists/class-cp/1715105400000-class-list.pdf",
  "message": "25 enfants créés à partir du PDF"
}
```

---

## Messages

### GET `/messages/conversations`
Get all conversations for user

```bash
curl http://localhost:4629/api/messages/conversations \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
[
  {
    "id": "conv-1",
    "user1_id": "anim-1",
    "user2_id": "parent-1",
    "type": "animator_parent",
    "user1_name": "Marie",
    "user1_role": "animator",
    "user2_name": "Jean",
    "user2_role": "parent",
    "last_message": "Merci pour la mise à jour!",
    "last_message_at": "2026-05-07T17:00:00Z"
  }
]
```

---

### GET `/messages/conversation/:conversationId`
Get messages in conversation

```bash
curl http://localhost:4629/api/messages/conversation/conv-1 \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
[
  {
    "id": "msg-1",
    "sender_id": "anim-1",
    "receiver_id": "parent-1",
    "message_type": "text",
    "content": "Bonjour! Marie a eu une bonne journée",
    "audio_path": null,
    "created_at": "2026-05-07T16:45:00Z",
    "first_name": "Marie",
    "role": "animator"
  }
]
```

---

### POST `/messages/send`
Send text message

```bash
curl -X POST http://localhost:4629/api/messages/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "parent-1",
    "conversationId": null,
    "message": "Marie a été très sage aujourd hui!"
  }'
```

**Response:**
```json
{
  "id": "msg-123",
  "success": true
}
```

---

## Health Check

### GET `/health`
Check API status

```bash
curl http://localhost:4629/api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Error Responses

All errors return appropriate HTTP status codes:

```json
{
  "error": "Description de l'erreur"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request (missing fields, invalid format)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (wrong role/permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## Example: Complete Flow

### 1. Animator Login
```bash
TOKEN=$(curl -s -X POST http://localhost:4629/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "animator@tonylaine.fr",
    "password": "password",
    "role": "animator"
  }' | jq -r '.token')
```

### 2. Get All Children
```bash
curl http://localhost:4629/api/children \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. Upload Creation for Child
```bash
curl -X POST http://localhost:4629/api/uploads/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@drawing.jpg" \
  -F "childId=child-1" \
  -F "title=Dessin du jour"
```

### 4. Send Message to Parent
```bash
curl -X POST http://localhost:4629/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "parent-1",
    "message": "Marie a été super aujourd hui!"
  }'
```

---

## Testing with Postman

1. Create environment:
   - `base_url`: http://localhost:4629/api
   - `token`: [copy from login response]

2. Create requests for each endpoint above

3. Pre-request script for auth:
```javascript
// Run login first, save token to {{token}}
pm.environment.set("token", pm.response.json().token);
```

---

## Rate Limiting

Currently not implemented. Will be added before production.

Recommendations:
- 100 requests/minute per user
- 1000 requests/minute per IP
- Alert on suspicious activity
