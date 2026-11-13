```markdown
# ms-pedidos · Taller 1 (Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **pedidos** de la aplicación AgroRed, con **Node.js + Express** organizado en capas y persistencia en **MySQL** (`mysql2`). Es el microservicio encargado de gestionar las solicitudes y distribución de productos, relacionándose con los servicios de clientes y productos.

Esta es la versión adaptada con persistencia real en base de datos relacional.

---

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```bash
npm install          # descarga dependencias en node_modules
copy .env.example .env    # en Windows (en Linux/Mac: cp .env.example .env)
# Configura tus credenciales en el archivo .env creado
npm run dev          # inicia y se reinicia solo al guardar cambios

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
| `src/middleware/auth.js` | Seguridad | Autenticación JWT y control de acceso basado en roles (RBAC) |

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
CLIENTES_URL=[http://127.0.0.1:3002](http://127.0.0.1:3002)
PRODUCTOS_URL=[http://127.0.0.1:3003](http://127.0.0.1:3003)
JWT_SECRET=Frase-secreta-compartida-del-grupo

```

---

## Atributos de la Entidad

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
| --- | --- | --- | --- |
| `id` | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| `cliente_id` | entero | Sí | Positivo; debe corresponder a un cliente existente |
| `producto_id` | entero | Sí | Positivo; debe corresponder a un producto existente |
| `cantidad` | entero | Sí | Mayor que 0 |
| `centro_distribucion` | texto | Sí | Debe ser uno de los centros permitidos (ej. Bogotá, Cali) |
| `estado` | texto | Sí | Uno de los estados permitidos (recibido, despachado, entregado) |
| `fecha` | texto | Sí | Formato de fecha válido (YYYY-MM-DD) |

---

## Relaciones entre Microservicios

`ms-pedidos` almacena las referencias `cliente_id` y `producto_id`, comunicándose de forma síncrona con los otros servicios:

| Atributo | Microservicio consultado | Para validar (crear/actualizar) | Para componer (al listar/obtener) |
| --- | --- | --- | --- |
| `cliente_id` | `ms-clientes` | `GET /clientes/:id` | `GET /clientes?ids=...` (Lotes) |
| `producto_id` | `ms-productos` | `GET /productos/:id` | `GET /productos?ids=...` (Lotes) |

*(Nota: Implementa degradación controlada; si un microservicio externo no responde al listar, los datos compuestos devuelven `null` evitando la caída del sistema).*

---

## Endpoints

| Método | URI | Seguridad / Roles | Respuesta exitosa | Errores |
| --- | --- | --- | --- | --- |
| **GET** | `/health` | Público | `200` `{"servicio": "ms-pedidos", "estado": "ok"}` | — |
| **GET** | `/pedidos` | Token JWT | `200`, arreglo de pedidos con datos compuestos | `401` |
| **GET** | `/pedidos/:id` | Token JWT | `200`, el pedido solicitado | `400`, `404` |
| **POST** | `/pedidos` | Token JWT (`administrador`, `comercial`) | `201`, el pedido creado + Location | `400`, `401`, `403`, `503` |
| **PUT** | `/pedidos/:id` | Token JWT (`administrador`, `comercial`) | `200`, pedido actualizado | `400`, `401`, `403`, `404` |
| **DELETE** | `/pedidos/:id` | Token JWT (`administrador`, `comercial`) | `204`, sin contenido | `401`, `403`, `404` |

Ejemplo de cuerpo para **POST**:

```json
{
  "cliente_id": 1,
  "producto_id": 2,
  "cantidad": 50,
  "centro_distribucion": "Cali",
  "estado": "recibido",
  "fecha": "2026-11-12"
}

```

---

## Formato de los Errores

Todos los errores responden con el mismo formato estándar:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "cliente_id es obligatorio y debe ser un número válido",
    "cantidad debe ser mayor a 0"
  ]
}

```

---

## Pruebas

Colección completa de Postman en `docs/ms-pedidos.postman_collection.json` (**24 casos de prueba** abarcando CRUD, filtros, lotes, seguridad JWT y relaciones con microservicios).

```

<ElicitationsGroup message="¿Necesitas ayuda con algún otro detalle del proyecto o con la estructura para el informe en PDF?">
  <Elicitation label="Estructura para el informe PDF" query="¿Cómo debo organizar las secciones y capturas para el informe PDF del taller?"/>
  <Elicitation label="Todo listo" query="Ya guardé el README, pasemos a lo siguiente"/>
</ElicitationsGroup>

```
