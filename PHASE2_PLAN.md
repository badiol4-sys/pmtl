# Phase 2 - Implementation Plan

## Priority Order (by complexity & importance)

### 1️⃣ Notes de Comportement (Frontend + Backend)
- [ ] Create BehaviorNoteForm component
- [ ] Create API endpoint POST /api/notes/add
- [ ] Add to animator dashboard
- [ ] Display in parent dashboard
- [ ] Estimated: 1.5 hours

### 2️⃣ Notifications Toast System
- [ ] Create Toast component (reusable)
- [ ] Setup context for notifications
- [ ] Trigger on key events
- [ ] Auto-dismiss after 5s
- [ ] Estimated: 45 min

### 3️⃣ Pagination & Search
- [ ] Add search bar to children lists
- [ ] Implement pagination (10 items/page)
- [ ] Add filter by class
- [ ] Update API endpoints to support limit/offset
- [ ] Estimated: 1 hour

### 4️⃣ Audio Recording + Transcription
- [ ] Complete MessageBox audio recording
- [ ] Create API endpoint for audio upload
- [ ] Integrate Claude transcription
- [ ] Display transcribed text
- [ ] Estimated: 2 hours

### 5️⃣ WebSocket Messagerie Temps-Réel
- [ ] Setup WebSocket connection
- [ ] Implement live message delivery
- [ ] Add typing indicator
- [ ] Real-time notification
- [ ] Estimated: 2 hours

### 6️⃣ Admin Dashboard
- [ ] Create admin page
- [ ] Stats cards (children, messages, uploads)
- [ ] User management table
- [ ] Recent activity log
- [ ] Estimated: 1.5 hours

### 7️⃣ Export PDF/CSV
- [ ] Export children list
- [ ] Export messages
- [ ] Export behavior notes
- [ ] Estimated: 1 hour

### 8️⃣ Mobile Responsive (if time)
- [ ] Mobile menu (hamburger)
- [ ] Responsive dashboards
- [ ] Touch-friendly buttons
- [ ] Estimated: 1+ hours

---

## Total Time Estimate: 9-10 hours

With >8h available, can complete tasks 1-7 fully, task 8 partially.

---

## Getting Started

Start with task 1 (Notes) - it's critical and unblocks parent dashboard.
