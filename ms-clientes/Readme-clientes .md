# ms-clientes · Microservicio del Taller (Módulo 3)

**Redes y Servicios Multimedia · UAO · Microservicio de clientes de la aplicación**, con **Node.js + Express** organizado en capas. Construido a partir de la plantilla base, adaptando todas las capas a la entidad de clientes.

**Esta es la versión del Taller 1 y 2:** datos en persistencia MySQL y operaciones principales.

## Cómo ejecutarlo

**Requisitos:** Node.js LTS 22 o superior (`node -v`) y MySQL 8 o superior.

1. **Crear la base de datos y su usuario (como root en la consola de MySQL):**

   ```sql
   CREATE DATABASE clientes_db;
   CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
   GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';

   Abrir un terminal y ejecutar:

Bash
npm install
copy .env.example .env
npm run dev

En Linux/Mac, utiliza cp .env.example .env en lugar de copy.

Probar en el navegador o Postman:

http://localhost:3002/health

http://localhost:3002/clientes

## Capas 

| Archivo | Capa | Responsabilidad |
| :--- | :--- | :--- |
| **src/index.js** | **Arranque** | Lee PORT y HOST y pone el servidor a escuchar. |
| **src/app.js** | **Configuración** | Middlewares, /health, montaje de rutas y manejo de errores. |
| **src/routes/clientes.routes.js** | **Presentación** | Método HTTP + URI → función del controlador. |
| **src/controllers/clientes.controller.js** | **Presentación** | Lee la petición, llama al servicio y arma la respuesta. |
| **src/services/clientes.service.js** | **Lógica de negocio** | Validaciones y reglas (NIT único); no conoce HTTP ni la base de datos. |
| **src/repositories/clientes.repository.js** | **Acceso a datos** | Guarda y consulta los datos en MySQL. |
| **src/models/cliente.js** | **Modelo** | Atributos de la entidad y su validación. |
| **src/utils/http-error.js** | **Utilidad** | Error con código de estado HTTP. |


## Endpoints (Taller 1 y 2)

| Método | URI | Respuesta |
| :--- | :--- | :--- |
| **GET** | **/health** | **200** `{"servicio":"ms-clientes","estado":"ok"}` |
| **GET** | **/clientes** | **200** Arreglo de clientes. |
| **GET** | **/clientes/:id** | **200** Cliente encontrado · **400** ID inválido · **404** No existe. |
| **POST** | **/clientes** | **201** Cliente creado · **400** Datos inválidos · **409** NIT repetido. |
| **PUT** | **/clientes/:id** | **200** Cliente actualizado · **400** ID o datos inválidos · **404** No existe · **409** NIT repetido. |
| **DELETE** | **/clientes/:id** | **200** Cliente eliminado · **400** ID inválido · **404** No existe. |

## Ejemplo de cuerpo para POST / PUT

{
  "nombre": "Distribuidora del Valle",
  "nit": "900123456-1",
  "ciudad": "Cali",
  "telefono": "3101234567",
  "tipo": "distribuidor"
}

Los tipos válidos para los clientes son: distribuidor o comercio.

## Relaciones
Como ms-clientes es un servicio consultado por otros microservicios de la arquitectura AgroRed, se documenta a continuación quién realiza peticiones y los contratos de datos asociados:

## Subconsultas de Pedidos 

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
| :--- | :--- | :--- | :--- | :--- |
| **cliente_id** | `ms-clientes` | `GET /clientes/:id` | `GET /clientes?ids=...` | `id`, `nombre`, `ciudad`,`tipo` |


| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
| :--- | :--- | :--- |
| **ms-pedidos** | `GET /clientes/:id` · `GET /clientes?ids=...` | `id`, `nombre`, `ciudad` `tipo`  |