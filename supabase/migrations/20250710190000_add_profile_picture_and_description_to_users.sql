-- Agregar columnas de foto de perfil y descripción a la tabla users
ALTER TABLE users
ADD COLUMN profile_picture text,
ADD COLUMN description text; 