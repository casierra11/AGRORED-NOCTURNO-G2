# ms-pedidos · Taller 1 (Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **pedidos** de la aplicación AgroRed, con **Node.js + Express** organizado en capas. Es el microservicio encargado de gestionar las solicitudes y distribución de productos, relacionándose con los servicios de clientes y productos.

Esta es la versión del Taller 1: datos en memoria y operaciones base. La versión completa se entrega en talleres posteriores.

---

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```bash
npm install                 # descarga dependencias en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador o Postman: `http://localhost:3004/health` y `http://localhost:3004/pedidos`

---

## Capas

| Archivo | Capa | Responsabilidad |
| :--- | :--- | :--- |
| `src/index.js` | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| `src/app.js` | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| `src/routes/pedidos.routes.js` | Presentación | Método HTTP + URI → función del controlador |
| `src/controllers/pedidos.controller.js` | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| `src/services/pedidos.service.js` | Lógica de negocio | Validaciones y reglas (cantidad > 0, validación de referencias); no conoce HTTP ni la base de datos |
| `src/repositories/pedidos.repository.js` | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| `src/models/pedido.js` | Modelo | Atributos de la entidad y su validación |
| `src/utils/http-error.js` | Utilidad | Error con código de estado HTTP |

---

## Atributos de la Entidad

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
| :--- | :--- | :--- | :--- |
| `id` | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| `cliente_id` | entero | Sí | Positivo; debe corresponder a un cliente existente |
| `producto_id` | entero | Sí | Positivo; debe corresponder a un producto existente |
| `cantidad` | entero (o decimal) | Sí | Mayor que 0 |
| `centro_distribucion` | texto | Sí | No vacío; indica el destino o centro de despacho |
| `estado` | texto | Sí | Uno de los estados permitidos (ej. recibido, despachado, entregado) |
| `fecha` | texto (o fecha) | Sí | Formato de fecha válido (ej. YYYY-MM-DD) |

---

## Endpoints (Taller 1)

| Método | URI | Respuesta exitosa | Errores |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | `200` `{"servicio": "ms-pedidos", "estado": "ok"}` | — |
| **GET** | `/pedidos` | `200`, arreglo de pedidos | — |
| **GET** | `/pedidos/:id` | `200`, el pedido solicitado | `400` id no numérico · `404` no existe |
| **POST** | `/pedidos` | `201`, el pedido creado con su id + cabecera Location | `400` datos inválidos |

Ejemplo de cuerpo para **POST**:
```json
{
  "cliente_id": 1,
  "producto_id": 2,
  "cantidad": 5,
  "centro_distribucion": "Cali Norte",
  "estado": "recibido",
  "fecha": "2026-10-29"
}
```

---

## Formato de los Errores

Todos los errores responden con el mismo formato, para que quien consume el servicio los maneje siempre igual (la lista de detalles aparece solo en los errores de validación):
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

## Relaciones

El microservicio **`ms-pedidos`** maneja relaciones directas con otros microservicios del sistema mediante referencias por ID y objetos relacionados que se integran en la respuesta:
* **Atributos de referencia:** Incorpora `cliente_id` y `producto_id` para asociar el pedido con su respectivo cliente y producto.
* **Objeto relacionado en la respuesta:** El contrato de la entidad incluye los objetos relacionados para enriquecer la consulta, tales como `cliente: {id, nombre, email}` y `producto: {id, nombre, precio}`.