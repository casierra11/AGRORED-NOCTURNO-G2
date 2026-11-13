# Microservicio de Lotes (`ms-lotes`) — Contrato de la API

**Proyecto:** AgroRed (`AGRORED-NOCTURNO-G2`)  
**Responsable:** Víctor Manuel Salazar Chaparro  
**Puerto asignado:** `3005`

Este microservicio gestiona el ciclo de vida y trazabilidad de los lotes de producción agrícola en **AgroRed**, incluyendo su código único, producto asociado, fecha de producción, cantidad y resultado de control de calidad. Implementa arquitectura en capas, persistencia en MySQL, autenticación mediante tokens JWT con control de acceso basado en roles (RBAC) e integración síncrona con `ms-productos`.

---

## 1. Cómo ejecutarlo

**Requisitos:** Node.js (v20 o superior) y MySQL / MariaDB (vía XAMPP o MySQL Workbench).

### Paso 1: Crear la base de datos y su usuario
Abre tu consola de MySQL o phpMyAdmin y ejecuta:

```sql
CREATE DATABASE lotes_db;
CREATE USER 'lotes_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON lotes_db.* TO 'lotes_user'@'localhost';
FLUSH PRIVILEGES;
```

### Paso 2: Crear la tabla e insertar datos iniciales
Ejecuta el script ubicado en `db/schema.sql` dentro de la base de datos `lotes_db`.

### Paso 3: Instalar dependencias
En la terminal, ubicado dentro de la carpeta `ms-lotes`, instala los módulos necesarios (`express`, `mysql2`, `jsonwebtoken`, `dotenv`, etc.):

```bash
npm install
```

### Paso 4: Configurar variables de entorno
Crea un archivo `.env` en la raíz de `ms-lotes` tomando como base `.env.example` (asegurando que `JWT_SECRET` coincida exactamente con la de `ms-usuarios` y `ms-productos`):

```env
PORT=3005
HOST=127.0.0.1

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=lotes_db
DB_USER=lotes_user
DB_PASSWORD=una-clave-segura

JWT_SECRET=clave_secreta_compartida_grupo
PRODUCTOS_URL=[http://127.0.0.1:3003](http://127.0.0.1:3003)
```

### Paso 5: Levantar el servidor

```bash
npm run dev
```

El servicio quedará escuchando en `http://127.0.0.1:3005`.

---

## 2. Representación y Atributos

### Representación JSON de un lote (respuesta compuesta)
```json
{
  "id": 1,
  "codigo_lote": "LOT-1001",
  "producto_id": 1,
  "fecha_produccion": "2026-10-26",
  "cantidad": 350,
  "resultado_calidad": "aprobado",
  "producto": {
    "id": 1,
    "nombre": "Aguacate Hass",
    "categoria": "Fruta"
  }
}
```

### Tabla de Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas / Descripción |
| :--- | :--- | :---: | :--- |
| **`id`** | Entero | No (lo asigna BD) | Identificador autoincremental único en MySQL. |
| **`codigo_lote`** | Texto | Sí | Código único de trazabilidad del lote (retorna `409` si ya existe). |
| **`producto_id`** | Entero | Sí | Entero positivo que referencia un producto válido en `ms-productos`. |
| **`fecha_produccion`** | Texto (`Date`) | Sí | Formato `YYYY-MM-DD`. No puede ser una fecha futura (`400`). |
| **`cantidad`** | Entero | Sí | Cantidad producida; debe ser estrictamente mayor a `0` (`400`). |
| **`resultado_calidad`** | Texto | Sí | Estado del control de calidad (`aprobado`, `pendiente`, `rechazado`). |

---

## 3. Endpoints y Seguridad (JWT + RBAC)

Todas las rutas requieren la cabecera `Authorization: Bearer <token>` emitida por `ms-usuarios` (puerto `3001`).

* **Lectura (`GET`):** Permitida para cualquier usuario autenticado (`administrador`, `ventas`).
* **Escritura (`POST`, `PUT`, `DELETE`):** Restringida exclusivamente al rol `administrador` (otros roles reciben `403 Forbidden`).

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Listar todos** | `GET` | `/lotes` | - | `200 OK` + arreglo compuesto | `401` |
| **Filtrar por calidad** | `GET` | `/lotes?resultado_calidad=aprobado` | - | `200 OK` + arreglo filtrado | `400`, `401` |
| **Obtener por ID** | `GET` | `/lotes/:id` | - | `200 OK` + objeto compuesto | `400`, `401`, `404` |
| **Crear lote** | `POST` | `/lotes` | JSON sin `id` | `201 Created` + objeto creado | `400`, `401`, `403`, `409`, `503` |
| **Actualizar lote** | `PUT` | `/lotes/:id` | JSON completo sin `id` | `200 OK` + objeto editado | `400`, `401`, `403`, `404`, `409`, `503` |
| **Eliminar lote** | `DELETE` | `/lotes/:id` | - | `204 No Content` (sin cuerpo) | `400`, `401`, `403`, `404` |

### Ejemplos de Petición y Respuesta

**Crear un lote (`POST /lotes`):**
```json
// Request Body
{
  "codigo_lote":