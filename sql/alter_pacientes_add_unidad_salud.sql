-- Agrega columna de establecimiento (unidad de salud) a la tabla pacientes
-- y garantiza que los números de expediente sean únicos por establecimiento.

BEGIN;

-- 1) Añadir columna si no existe
ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS unidad_salud text;

-- 2) (Opcional) Eliminar posible restricción única antigua solo por numero_expediente
--    El nombre por defecto de la restricción suele ser "pacientes_numero_expediente_key"
ALTER TABLE public.pacientes
  DROP CONSTRAINT IF EXISTS pacientes_numero_expediente_key;

-- 3) Crear índice único compuesto por establecimiento + número de expediente
CREATE UNIQUE INDEX IF NOT EXISTS pacientes_unidad_salud_expediente_uidx
  ON public.pacientes (unidad_salud, numero_expediente);

-- 4) Índices de apoyo para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS pacientes_unidad_salud_idx
  ON public.pacientes (unidad_salud);

CREATE INDEX IF NOT EXISTS pacientes_numero_expediente_idx
  ON public.pacientes (numero_expediente);

COMMIT;
