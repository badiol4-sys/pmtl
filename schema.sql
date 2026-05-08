-- Users Table (multi-role)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  password_hash TEXT,
  role TEXT NOT NULL, -- 'animator', 'teacher', 'parent', 'director', 'alsh'
  first_name TEXT NOT NULL,
  last_name TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classes/Groupes
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL, -- "CP", "CE1", "Pause Méridienne A", etc.
  type TEXT, -- 'class', 'pause_meridienne', 'alsh'
  teacher_id TEXT,
  animator_id TEXT,
  school_name TEXT DEFAULT 'Tony Lainé',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (animator_id) REFERENCES users(id)
);

-- Enfants
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  parent_code TEXT NOT NULL, -- code d'accès parent unique (basé tél)
  phone_parent TEXT, -- num tel pour retrouver autres enfants du même parent
  date_of_birth DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Parent-Children Relationship (un parent peut avoir plusieurs enfants)
CREATE TABLE parent_children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  parent_code TEXT NOT NULL, -- associe parent avec children
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id),
  UNIQUE(parent_id, child_id)
);

-- Uploads / Creations (dessins, travaux, photos)
CREATE TABLE uploads (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  uploader_id TEXT NOT NULL, -- animator ou teacher
  uploader_role TEXT NOT NULL, -- 'animator', 'teacher'
  file_path TEXT NOT NULL, -- chemin dans R2
  file_type TEXT, -- 'image', 'video', 'document'
  title TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- Behavior Notes (notes de comportement)
CREATE TABLE behavior_notes (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  animator_id TEXT NOT NULL,
  note TEXT NOT NULL,
  category TEXT, -- 'positive', 'neutral', 'concern'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (animator_id) REFERENCES users(id)
);

-- Messages (text + audio)
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  message_type TEXT, -- 'text', 'audio'
  content TEXT, -- text ou transcription
  audio_path TEXT, -- chemin fichier audio en R2
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Conversations (grouper messages entre deux personnes)
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  type TEXT, -- 'animator_parent', 'teacher_parent', 'animator_teacher'
  last_message_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT, -- 'message', 'upload', 'behavior', 'info'
  title TEXT,
  message TEXT,
  related_id TEXT, -- child_id, message_id, upload_id
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- PDF Upload History (pour tracer les imports)
CREATE TABLE pdf_uploads (
  id TEXT PRIMARY KEY,
  animator_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  file_path TEXT,
  children_extracted INT, -- nombre d'enfants extraits
  status TEXT, -- 'pending', 'completed', 'error'
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animator_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Indexes pour performance
CREATE INDEX idx_children_class ON children(class_id);
CREATE INDEX idx_children_parent_code ON children(parent_code);
CREATE INDEX idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX idx_parent_children_child ON parent_children(child_id);
CREATE INDEX idx_uploads_child ON uploads(child_id);
CREATE INDEX idx_uploads_uploader ON uploads(uploader_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
