# ms-pedidos · Taller 1 (Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **pedidos** de la aplicación AgroRed, con **Node.js + Express** organizado en capas y persistencia en **MySQL** (`mysql2`). Es el microservicio encargado de gestionar las solicitudes y distribución de productos, relacionándose con los servicios de clientes y productos[cite: 1].

Esta es la versión adaptada con persistencia real en base de datos relacional.

---

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```bash
npm install               # descarga dependencias en node_modules
copy .env.example .env    # en Windows (en Linux/Mac: cp .env.example .env)
# Configura tus credenciales en el archivo .env creado
npm run dev               # inicia y se reinicia solo al guardar cambios

```

Prueben en el navegador o Postman: `http://localhost:3004/health` y `http://localhost:3004/pedidos`

---

## Capas

| Archivo | Capa | Responsabilidad |
| --- | --- | --- |
| `src/index.js` | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| `src/app.js` | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| `src/routes/pedidos.routes.js` | Presentación | Método HTTP + URI → función del controlador |
| `src/controllers/pedidos.controller.js` | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| `src/services/pedidos.service.js` | Lógica de negocio | Validaciones y reglas (cantidad > 0, validación de referencias); no conoce HTTP ni la base de datos |
| `src/repositories/pedidos.repository.js` | Acceso a datos | Guarda y consulta directamente en MySQL usando `async/await` |
| `src/config/db.js` | Configuración | Pool de conexiones a la base de datos `pedidos_db` con `mysql2/promise` |
| `src/models/pedido.js` | Modelo | Atributos de la entidad y su validación |
| `src/utils/http-error.js` | Utilidad | Error con código de estado HTTP |

---

## Configuración del Entorno (.env)

El archivo `.env` requiere las siguientes variables de configuración:

```env
PORT=3004
HOST=127.0.0.1
ROLES=administrador,comercial,produccion
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pedidos_db
DB_PORT=3306

```

---

## Atributos de la Entidad

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
| --- | --- | --- | --- |
| `id` | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| `cliente_id` | entero | Sí | Positivo; debe corresponder a un cliente existente

 |
| `producto_id` | entero | Sí | Positivo; debe corresponder a un producto existente

 |
| `cantidad` | entero (o decimal) | Sí | Mayor que 0 |
| `centro_distribucion` | texto | Sí | No vacío; indica el destino o centro de despacho

 |
| `estado` | texto | Sí | Uno de los estados permitidos (ej. recibido, despachado, entregado)

 |
| `fecha` | texto (o fecha) | Sí | Formato de fecha válido (ej. YYYY-MM-DD) |

---

## Endpoints

| Método | URI | Respuesta exitosa | Errores |
| --- | --- | --- | --- |
| **GET** | `/health` | `200` `{"servicio": "ms-pedidos", "estado": "ok"}` | — |
| **GET** | `/pedidos` | `200`, arreglo de pedidos desde MySQL | — |
| **GET** | `/pedidos/:id` | `200`, el pedido solicitado | `400` id no numérico · `404` no existe |
| **POST** | `/pedidos` | `201`, el pedido creado con su id + cabecera Location | `400` datos inválidos |

Ejemplo de cuerpo para **POST**:

```json
{
  "cliente_id": 1,
  "producto_id": 2,
  "cantidad": 50,
  "centro_distribucion": "Cali",
  "estado": "recibido",
  "fecha": "2026-10-25"
}

```

---

## Formato de los Errores

Todos los errores responden con el mismo formato, para que quien consume el servicio los maneje siempre igual:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "cliente_id es obligatorio y debe ser un número válido",
    "cantidad debe ser mayor a 0"
  ]
}

```