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