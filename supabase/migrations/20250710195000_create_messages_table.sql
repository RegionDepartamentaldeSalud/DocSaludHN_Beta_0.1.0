-- Tabla para guardar mensajes de los chats
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat text NOT NULL, -- nombre o identificador del chat/canal
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  attachment_url text
);

-- Índice para buscar mensajes por chat y fecha
CREATE INDEX idx_messages_chat_created_at ON messages(chat, created_at DESC); 