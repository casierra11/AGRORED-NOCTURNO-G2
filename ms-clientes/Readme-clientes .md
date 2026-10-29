**\# ms-clientes · Microservicio del Taller 1 (Módulo 3\)**

**Redes y Servicios Multimedia · UAO · Microservicio de \*\*clientes\*\* de la aplicación,**  
**con \*\*Node.js \+ Express\*\* organizado en capas. Construido a partir de la plantilla**   
**base adaptando todas las capas a la entidad de clientes.**

**Esta es la versión del Taller 1: datos en memoria y operaciones principales.**

**\#\# Cómo ejecutarlo**

**Requisitos: Node.js LTS 22 o superior (\`node \-v\`).**

**\`\`\`abre un terminal y ejecuta :** 

**npm install                 \# descarga Express en node\_modules**  
**copy .env.example .env      \# en Windows (en Linux/Mac: cp .env.example .env)**  
**npm run dev                 \# inicia y se reinicia solo al guardar cambios**

**Prueben en el navegador o Postman: http\://localhost:3003/health y http\://localhost:3003/clientes** 

**Capas :**

| Archivo | Capa | Responsabilidad |
| :---- | :---- | :---- |
| **src/index.js** | **Arranque** | **Lee PORT y HOST y pone el servidor a escuchar** |
| **src/app.js** | **Configuración** | **Middlewares, /health, montaje de rutas, manejo de errores** |
| **src/routes/clientes.routes.js** | **Presentación** | **Método HTTP \+ URI → función del controlador** |
| **src/controllers/clientes.controller.js** | **Presentación** | **Lee la petición, llama al servicio, arma la respuesta** |
| **src/services/clientes.service.js** | **Lógica de negocio** | **Validaciones y reglas (NIT único); no conoce HTTP ni la base de datos** |
| **src/repositories/clientes.repository.js** | **Acceso a datos** | **Guarda y consulta (en memoria en el Taller 1\)** |
| **src/models/cliente.js** | **Modelo** | **Atributos de la entidad y su validación** |
| **src/utils/http-error.js** | **Utilidad** | **Error con código de estado HTTP** |

**Endpoints (Taller 1\)** 

| Método | URI | Respuesta |
| :---- | :---- | :---- |
| **GET** | **/health** | **200** {"servicio":"ms-clientes","estado":"ok"} |
| **GET** | **/clientes** | **200 arreglo de clientes** |
| **GET** | **/clientes/:id** | **200 cliente · 400 id inválido · 404 no existe** |
| **POST** | **/clientes** | **201 cliente creado · 400 datos inválidos · 409 NIT repetido** |

**Ejemplo de cuerpo para POST:`{`**

**`"nombre": "Distribuidora del Valle"`**

**`, "nit": "900123456-1",`**

 **`"ciudad": "Cali",`** 

**`"telefono": "3101234567",`** 

**`"tipo": "distribuidor"`**

**`}`**

**Los tipos válidos para los clientes son: `distribuidor` o `comercio`.**

