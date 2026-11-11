//esquem de bases de de datos para la tabla clientes
SET names utf8mb4;

CREATE TABLE clientes(
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
nit VARCHAR(20) NOT NULL UNIQUE,
ciudad VARCHAR(50) NOT NULL,
telefono VARCHAR(20) NOT NULL,
tipo ENUM('comercio', 'distribuidor') NOT NULL,
);
insert into clientes(nombre, nit, ciudad, telefono, tipo) values
('Juan Perez', '123456789', 'Bogotá', '3001234567', 'comercio'),
('Maria Gomez', '987654321', 'Medellín', '3109876543', 'distribuidor'),
('Carlos Rodriguez', '456789123', 'Cali', '3204567890', 'comercio');




