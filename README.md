# AgroRed S.A. – Grupo Nocturno G2 (`AGRORED-NOCTURNO-G2`)

Aplicación web distribuida basada en una arquitectura de **microservicios con Node.js (Express)** para la gestión agroindustrial, logística y de distribución de AgroRed, con persistencia aislada por servicio en **MySQL 8** (*Database-per-Service*), resolución de nombres con **BIND9** y puerta de enlace única (**API Gateway**) con **Apache HTTP Server**.

---

## 1. Integrantes del Grupo

| Integrante | Usuario de GitHub | Código | Rol en Despliegue | Microservicio a cargo |
| :--- | :--- | :--- | :--- | :--- |
| **Víctor Manuel Salazar Chaparro** | `VictorSalazar30` | 2221679 | Coordinador y Relator | `ms-lotes` (Puerto 3005) |
| **Juan Camilo Casierra Riascos** | `casierra11` | 2226055 | Integrador de aplicación | `ms-pedidos` (Puerto 3004) |
| **Brandon Montilla Hernández** | `Brandon1927` | 2220324 | Arquitecto | `ms-productos` (Puerto 3003) |
| **Juan David Ríos Gallego** | `JDRios17` | 2225674 | Integrador de datos y Documentador | `ms-clientes` (Puerto 3002) |

---

## 2. Tabla de Microservicios y Dependencias

| Carpeta | Entidad | Responsable | Puerto | Base de Datos | Depende de (Referencias REST) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ms-usuarios` | Usuarios y Auth | Docente / Integrador de aplicación | `3001` | `usuarios_db` | Ninguno (Emisor y validador JWT) |
| `ms-clientes` | Clientes | Juan David Ríos (`JDRios17`) | `3002` | `clientes_db` | Ninguno (Soporta consulta `?ids=`) |
| `ms-productos` | Productos | Brandon Montilla (`Brandon1927`) | `3003` | `productos_db` | Ninguno (Soporta consulta `?ids=`) |
| `ms-pedidos` | Pedidos | Juan Camilo Casierra (`casierra11`) | `3004` | `pedidos_db` | `ms-clientes` (3002), `ms-productos` (3003) |
| `ms-lotes` | Lotes | Víctor Manuel Salazar (`VictorSalazar30`) | `3005` | `lotes_db` | `ms-productos` (3003) |

---

## 3. Arquitectura y Topología de Red (Producción)

El sistema opera sobre dos servidores virtuales Ubuntu 22.04 en red privada Host-Only, exponiendo únicamente el puerto HTTP (`80/tcp`) hacia el cliente anfitrión Windows:

- **servidorUbuntu1 (`172.16.0.197`)**: Servidor DNS (`bind9`) y motor de base de datos (`MySQL`) escuchando en `127.0.0.1` y `172.16.0.197`, con el puerto `3306/tcp` restringido en `ufw` exclusivamente desde `172.16.0.198`.
- **servidorUbuntu2 (`172.16.0.198`)**: API Gateway (`Apache2` en puerto `80`), archivos estáticos del frontend (`/var/www/app`) y los 5 microservicios ejecutándose como servicios de `systemd` bajo el usuario sin privilegios `nodeapps` (escuchando exclusivamente en `127.0.0.1`).

| Componente | Servidor | Dirección IP | Puerto | Ruta / Servicio | Acceso permitido |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DNS (bind9)** | servidorUbuntu1 | `172.16.0.197` | `53` (UDP/TCP) | Zona `agrored.com` (`app` → `.198`) | Red local (Windows y VMs) |
| **MySQL Server** | servidorUbuntu1 | `172.16.0.197` | `3306` (TCP) | 5 esquemas independientes | Solo `servidorUbuntu2` (`172.16.0.198`) |
| **Apache Gateway** | servidorUbuntu2 | `172.16.0.198` | `80` (TCP) | `/var/www/app` y `/api/*` | Clientes Windows (`http://app.agrored.com`) |
| **Microservicios** | servidorUbuntu2 | `127.0.0.1` | `3001–3005` (TCP) | `ms-*.service` (`systemd`) | Solo local (`servidorUbuntu2`) |

---

## 4. Estructura del Repositorio

```text
AGRORED-NOCTURNO-G2/
├── deploy/                    # Archivos de configuración de producción (sin secretos)
│   ├── app.conf               # VirtualHost de Apache (API Gateway + DocumentRoot)
│   ├── setup-db.sql           # Script de creación de BDs y usuarios aislados
│   ├── ms-usuarios.service    # Unidad systemd para ms-usuarios (3001)
│   ├── ms-clientes.service    # Unidad systemd para ms-clientes (3002)
│   ├── ms-productos.service   # Unidad systemd para ms-productos (3003)
│   ├── ms-pedidos.service     # Unidad systemd para ms-pedidos (3004)
│   └── ms-lotes.service       # Unidad systemd para ms-lotes (3005)
├── frontend/                  # Interfaz web HTML/CSS/JS conectada a rutas relativas /api
├── ms-usuarios/               # Microservicio de autenticación, tokens JWT y gestión de usuarios
├── ms-clientes/               # Microservicio de gestión de clientes y comercios
├── ms-productos/              # Microservicio de catálogo de productos de la agroindustria
├── ms-pedidos/                # Microservicio de gestión de pedidos (Node.js + Express)
├── ms-lotes/                  # Microservicio de gestión de lotes de producción
└── README.md                  # Documentación general del proyecto y guía de despliegue