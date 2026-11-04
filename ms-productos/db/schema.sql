SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(30) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  precio DECIMAL(10,2) NOT NULL
);

INSERT INTO productos (nombre, categoria, unidad, precio) VALUES
('Aguacate Hass', 'fruta', 'kg', 8500.00),
('Tomate Chonto', 'hortaliza', 'caja', 45000.00),
('Mermelada de Mora 250g', 'procesado', 'caja', 62000.00);