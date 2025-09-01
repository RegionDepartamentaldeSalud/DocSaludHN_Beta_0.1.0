/*
  # Crear tabla de usuarios para FACTUSALUD

  1. Nueva tabla
    - `users`
      - `id` (uuid, primary key) - ID único del usuario
      - `email` (text, unique) - Correo electrónico del usuario
      - `full_name` (text) - Nombre completo del usuario
      - `institution` (text) - Institución donde trabaja
      - `municipality` (text) - Municipio donde está ubicada la institución
      - `created_at` (timestamp) - Fecha de creación del registro
      - `updated_at` (timestamp) - Fecha de última actualización

  2. Seguridad
    - Habilitar RLS en la tabla `users`
    - Agregar políticas para que los usuarios autenticados puedan leer y actualizar sus propios datos
    - Permitir inserción para usuarios autenticados (registro)
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  institution text NOT NULL,
  municipality text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan leer sus propios datos
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar sus propios datos
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para permitir inserción durante el registro
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();