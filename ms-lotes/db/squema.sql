CREATE TABLE lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_lote VARCHAR(50) NOT NULL UNIQUE,
  producto_id INT NOT NULL,
  fecha_produccion DATE NOT NULL,
  cantidad INT NOT NULL,
  resultado_calidad VARCHAR(50) NOT NULL
);

INSERT INTO lotes (codigo_lote, producto_id, fecha_produccion, cantidad, resultado_calidad) VALUES
('LOT-1001', 10, '2026-10-25', 500, 'aprobado'),
('LOT-1002', 15, '2026-10-26', 350, 'pendiente'),
('LOT-1003', 22, '2026-10-27', 120, 'rechazado');