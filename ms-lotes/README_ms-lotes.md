# Microservicio de Lotes (ms-lotes)

Este microservicio forma parte del proyecto AgroRed (Grupo Nocturno G2). Es responsable de gestionar la información de los lotes de producción, incluyendo su código, producto asociado, fecha de producción, cantidad y resultados de calidad.

## 1. Estructura del repositorio

El código sigue una arquitectura de 4 capas para mantener una separación clara de responsabilidades. A continuación se detalla el contenido de cada directorio:

* **`src/`**: Carpeta principal que contiene todo el código fuente de la aplicación.

  * **`controllers/`**: (Capa de Presentación) Contiene `lotes.controller.js`. Recibe las peticiones HTTP (req), llama al servicio correspondiente y devuelve las respuestas HTTP (res) con los códigos de estado adecuados.

  * **`services/`**: (Capa de Lógica de Negocio) Contiene `lotes.service.js`. Aplica las reglas del negocio (ej. evitar códigos duplicados) y coordina la comunicación entre el modelo y el repositorio.

  * **`models/`**: (Capa de Modelo) Contiene `lote.js`. Define los atributos exactos de la entidad (id, codigo_lote, producto_id, fecha_produccion, cantidad, resultado_calidad) y contiene las funciones de validación. No interactúa con HTTP ni con bases de datos.

  * **`repositories/`**: (Capa de Acceso a Datos) Contiene `lotes.repository.js`. Es la única capa que sabe cómo y dónde se guardan los datos (actualmente en un arreglo en memoria).

  * **`routes/`**: Contiene `lotes.routes.js`. Define los endpoints de la API (las rutas GET y POST) y los enlaza con las funciones del controlador.

  * **`utils/`**: Contiene utilidades genéricas, como el manejador de errores personalizado `http-error.js`.

  * **`app.js`**: Archivo de configuración de Express. Conecta las rutas y los middlewares (como el manejo de JSON y el control de errores).

  * **`index.js`**: Archivo de arranque principal. Importa la configuración de `app.js` e inicia el servidor web escuchando en el puerto asignado.

## 2. Cómo ejecutar el microservicio

Para levantar este microservicio de forma local, asegúrate de tener instalado Node.js en tu equipo. Luego, abre una terminal ubicándote exactamente dentro de la carpeta `ms-lotes` y sigue estos 3 pasos:

**Paso 1: Instalar las dependencias**
Descarga todas las librerías necesarias (como Express) ejecutando:

```
npm install

```

**Paso 2: Configurar las variables de entorno**
Crea un archivo llamado `.env` en la raíz de la carpeta `ms-lotes` (al mismo nivel que el `package.json`). Abre el archivo y define el puerto asignado a este microservicio:

```
PORT=3005

```

**Paso 3: Levantar el servidor en modo desarrollo**
Ejecuta el siguiente comando para iniciar el servidor con recarga automática:

```
npm run dev

```

Si todo es correcto, la terminal mostrará el mensaje `ms-usuarios escuchando en http://127.0.0.1:3005`.
*(Nota: El texto "ms-usuarios" viene de la configuración original del `package.json`, pero el servicio está corriendo correctamente para los lotes).*


----------------------------------------------- TALLER 2 -----------------------------------------------


# Microservicio de Lotes (ms-lotes) - Contrato de la API

**Proyecto:** AgroRed (Grupo Nocturno G2)
**Responsable Docente:** Víctor Manuel Salazar
**Puerto asignado:** 3005

Este microservicio es responsable de gestionar la información de los lotes de producción, incluyendo su código, producto asociado, fecha de producción, cantidad y resultados de calidad. Utiliza persistencia en base de datos relacional (MySQL).

---

## 1. Cómo ejecutarlo

Requisitos: Node.js (v20 o superior) y MySQL (o MariaDB vía XAMPP).

**Paso 1: Crear la base de datos y su usuario**
Abre tu consola de MySQL o phpMyAdmin y ejecuta:

```sql
CREATE DATABASE lotes_db;
CREATE USER 'lotes_user'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON lotes_db.* TO 'lotes_user'@'localhost';
FLUSH PRIVILEGES;

```

**Paso 2: Crear la tabla e insertar datos iniciales**
Ejecuta el código que se encuentra en el archivo `db/schema.sql` dentro de la base de datos `lotes_db` recién creada.

**Paso 3: Instalar dependencias**
En la terminal, ubicado en la carpeta `ms-lotes`, instala los módulos necesarios (incluyendo el driver de conexión `mysql2`):

```bash
npm install

```

**Paso 4: Configurar variables de entorno**
Crea un archivo `.env` en la raíz copiando la estructura de `.env.example` y ajusta tus credenciales de MySQL:

```env
PORT=3005
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=lotes_db
DB_USER=lotes_user
DB_PASSWORD=root

```

**Paso 5: Levantar el servidor**

```bash
npm run dev

```

---

## 2. Representación (JSON)

Ejemplo de la estructura de un objeto `lote` al consultar la API:

```json
{
  "id": 1,
  "codigo_lote": "LOT-1001",
  "producto_id": 10,
  "fecha_produccion": "2026-10-25",
  "cantidad": 500,
  "resultado_calidad": "aprobado"
}

```

---

## 3. Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas / Descripción |
| --- | --- | --- | --- |
| **id** | Entero | No (lo asigna BD) | Positivo y único. Autoincremental en MySQL. |
| **codigo_lote** | Texto | Sí | Debe ser único en el sistema. |
| **producto_id** | Entero | Sí | ID del producto asociado (foráneo lógico). |
| **fecha_produccion** | Texto (Date) | Sí | Formato YYYY-MM-DD. |
| **cantidad** | Entero | Sí | Debe ser mayor a `0`. |
| **resultado_calidad** | Texto | Sí | Estado del lote (ej. `aprobado`, `pendiente`, `rechazado`). |

---

## 4. Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
| --- | --- | --- | --- | --- | --- |
| Listar todos | GET | `/lotes` | - | `200` + arreglo | - |
| Listar (Filtrado) | GET | `/lotes?resultado_calidad=aprobado` | - | `200` + arreglo filtrado | - |
| Obtener por ID | GET | `/lotes/:id` | - | `200` + objeto | `404` (No encontrado) |
| Crear | POST | `/lotes` | JSON sin `id` | `201` + objeto creado | `400` (Datos inválidos), `409` (Código duplicado) |
| Actualizar | PUT | `/lotes/:id` | JSON completo sin `id` | `200` + objeto editado | `400` (Datos inválidos), `404`, `409` |
| Eliminar | DELETE | `/lotes/:id` | - | `204` (Sin contenido) | `404` (No encontrado) |

---

## 5. Estructura del Repositorio (Arquitectura de Capas)

* **`src/`**: Carpeta principal del código fuente.
* **`db.js`**: Crea y exporta el *pool* de conexiones a MySQL usando `mysql2/promise`.
* **`controllers/`**: (`lotes.controller.js`) Recibe peticiones HTTP, extrae datos y arma respuestas.
* **`services/`**: (`lotes.service.js`) Lógica de negocio, valida cantidades mayores a cero y evita códigos de lote duplicados.
* **`models/`**: (`lote.js`) Valida y construye la estructura limpia del JSON.
* **`repositories/`**: (`lotes.repository.js`) Capa de acceso a datos. Ejecuta las sentencias SQL reales usando el pool de conexiones.
* **`routes/`**: (`lotes.routes.js`) Define las rutas HTTP y las enlaza al controlador.


* **`db/`**:
* **`schema.sql`**: Script de creación de la base de datos, la tabla de lotes y los registros iniciales.


* **`docs/`**: Carpeta destinada a almacenar la colección exportada de pruebas en Postman.

---

¿Pasamos ahora a configurar la seguridad de los endpoints implementando el token JWT?