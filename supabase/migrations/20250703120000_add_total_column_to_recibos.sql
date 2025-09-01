-- Agrega la columna 'total' a la tabla 'Recibos' para almacenar el total de la factura
ALTER TABLE "Recibos"
ADD COLUMN total numeric(10,2) DEFAULT 0; 