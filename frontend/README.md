# Frontend · Usuarios

Inicio de sesión, administración de usuarios y "Mi perfil", conectados directamente a **ms-usuarios** (`http://localhost:3001`). HTML, CSS y JavaScript, sin framework.

## Cómo probarlo

1. ms-usuarios corriendo (`npm run dev`), con CORS activo (`app.use(cors())` en `src/app.js`).
2. Doble clic en `login.html`.
3. Entrar con `admin@empresa.com` / `Admin2026*`: lleva a **Usuarios**. Con cualquier otro rol, lleva a **Mi perfil**.

## Estructura

| Archivo | Qué hace |
|---|---|
| `login.html` | Inicio de sesión; lleva a cada usuario a la página de su rol |
| `usuarios.html` + `js/usuarios.js` | Lista, crea, edita y elimina usuarios (solo administrador) |
| `perfil.html` + `js/perfil.js` | Los datos del usuario que inició sesión (`GET /usuarios/me`) |
| `js/config.js` | Dirección de ms-usuarios y página de inicio de cada rol |
| `js/api.js` | Todas las llamadas a ms-usuarios, con el token |
| `js/sesion.js` | Login, usuario actual, cierre de sesión y control de acceso a cada página |
| `js/ui.js` | Mensajes y formularios |
| `css/estilos.css` | Estilos |

## Peticiones que hace

| Acción | Petición |
|---|---|
| Iniciar sesión | `POST /usuarios/login` |
| Listar | `GET /usuarios` |
| Crear | `POST /usuarios` |
| Editar | `PUT /usuarios/:id` (la contraseña solo se envía si se escribe una nueva) |
| Eliminar | `DELETE /usuarios/:id` |
| Mi perfil | `GET /usuarios/me` |

## En el Taller 3

En `js/config.js`, `API_USUARIOS` pasa a ser `'/api'`: el frontend y la API quedan en la misma dirección (`http://app.<dominio>`) a través del gateway, y CORS ya no hace falta.
