-- Tabla para almacenar información de pacientes
CREATE TABLE IF NOT EXISTS "pacientes" (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  numero_expediente text,
  numero_identidad text,
  direccion text,
  telefono text,
  edad integer,
  created_at timestamp with time zone DEFAULT now()
); 