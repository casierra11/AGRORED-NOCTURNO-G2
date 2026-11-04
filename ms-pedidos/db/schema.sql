-- Estructura de la base de datos para ms-pedidos
CREATE DATABASE IF NOT EXISTS pedidos_db;
USE pedidos_db;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    centro_distribucion VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba iniciales
INSERT INTO orders (cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha) VALUES 
(1, 2, 50, 'Cali', 'recibido', '2026-10-25'),
(2, 1, 120, 'Bogotá', 'despachado', '2026-10-26'),
(3, 3, 80, 'Cali', 'entregado', '2026-10-24');