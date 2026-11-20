# AgroRed S.A. – Sistema de Gestión Agroindustrial y Distribución (Arquitectura de Microservicios)

Aplicación web distribuida basada en microservicios con **Node.js (Express)**, persistencia aislada por servicio en **MySQL 8**, resolución de nombres con **BIND9** y puerta de enlace única (**API Gateway**) con **Apache HTTP Server**[cite: 25, 27].

## Integrantes del Grupo

| Integrante | Usuario de GitHub | Microservicio a cargo |
| :--- | :--- | :--- |
| Juan Camilo Casierra Riascos | `casierra11` | `ms-pedidos`[cite: 30] |
| Brandon Montilla Hernández | `Brandon1927` | `ms-productos`[cite: 30] |
| Juan David Rios Gallego | `JDRios17` | `ms-clientes`[cite: 30] |
| Víctor Manuel Salazar Chaparro | `VictorSalazar30` | `ms-lotes`[cite: 30] |

---

## Tabla de Microservicios

| Carpeta | Entidad | Responsable | Puerto | Depende de (Referencias) |
| :--- | :--- | :--- | :--- | :--- |
| `ms-usuarios` | Usuario | Docente | 3001 | Ninguno[cite: 28, 30] |
| `ms-clientes` | Clientes | Juan David Rios (`JDRios17`) | 3002 | Ninguno[cite: 30] |
| `ms-productos` | Productos | Brandon Montilla (`Brandon1927`) | 3003 | Ninguno[cite: 30] |
| `ms-pedidos` | Pedidos | Juan Camilo Casierra (`casierra11`) | 3004 | Clientes, Productos[cite: 30] |
| `ms-lotes` | Lotes | Víctor Manuel Salazar (`VictorSalazar30`) | 3005 | Productos[cite: 30] |

---

## 1. Arquitectura y Topología de Red

El sistema opera sobre dos servidores virtuales Ubuntu 22.04 en red privada *Host-Only* y el anfitrión Windows:

- **`servidorUbuntu1` (`172.16.0.197`)**: Servidor DNS (`bind9`) y motor de base de datos (`MySQL`)[cite: 12, 15, 22].
- **`servidorUbuntu2` (`172.16.0.198`)**: API Gateway (`Apache2` en puerto `80`), archivos estáticos del frontend (`/var/www/app`) y los 5 microservicios ejecutándose como servicios `systemd` bajo el usuario sin privilegios `nodeapps` (escuchando exclusivamente en `127.0.0.1`)[cite: 12, 15, 17, 18].

| Componente | Servidor | Dirección IP | Puerto | Base de Datos / Ruta | Acceso permitido |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DNS (`bind9`)** | `servidorUbuntu1` | `172.16.0.197` | 53 (UDP/TCP) | Zona `agrored.com` (`app` → `172.16.0.198`)[cite: 12, 19] | Red local (Windows y VMs)[cite: 12] |
| **MySQL Server** | `servidorUbuntu1` | `172.16.0.197` | 3306 (TCP) | 5 esquemas independientes (`usuarios_db`, `clientes_db`, `productos_db`, `pedidos_db`, `lotes_db`)[cite: 12, 15, 30] | Solo `servidorUbuntu2` (`172.16.0.198` + `ufw`)[cite: 12, 15] |
| **Apache Gateway** | `servidorUbuntu2` | `172.16.0.198` | 80 (TCP) | `/var/www/app` y `/api/*`[cite: 12, 20] | Clientes Windows (`http://app.agrored.com`)[cite: 12] |
| **`ms-usuarios`** | `servidorUbuntu2` | `127.0.0.1` | 3001 (TCP) | `usuarios_db` / `/api/usuarios`[cite: 15, 21, 28] | Solo local (`127.0.0.1` vía Apache)[cite: 12, 15] |
| **`ms-clientes`** | `servidorUbuntu2` | `127.0.0.1` | 3002 (TCP) | `clientes_db` / `/api/clientes`[cite: 15, 30] | Solo local (`127.0.0.1` vía Apache y REST local)[cite: 12, 15, 17, 20] |
| **`ms-productos`** | `servidorUbuntu2` | `127.0.0.1` | 3003 (TCP) | `productos_db` / `/api/productos`[cite: 15, 30] | Solo local (`127.0.0.1` vía Apache y REST local)[cite: 12, 15, 17, 20] |
| **`ms-pedidos`** | `servidorUbuntu2` | `127.0.0.1` | 3004 (TCP) | `pedidos_db` / `/api/pedidos`[cite: 15, 30] | Solo local (`127.0.0.1` vía Apache)[cite: 12, 15, 20] |
| **`ms-lotes`** | `servidorUbuntu2` | `127.0.0.1` | 3005 (TCP) | `lotes_db` / `/api/lotes`[cite: 15, 30] | Solo local (`127.0.0.1` vía Apache)[cite: 12, 15, 20] |

---

## 2. Estructura del Repositorio

```text
AGRORED-NOCTURNO-G2/
├── deploy/                  # Archivos de configuración de despliegue (Apache, systemd, SQL sin contraseñas)
│   ├── app.conf             # VirtualHost de Apache (API Gateway + DocumentRoot)
│   ├── init_databases.sql   # Script de creación de BDs y usuarios aislados (sin contraseñas)
│   └── *.service            # Unidades systemd para los microservicios
├── frontend/                # Interfaz web HTML/CSS/JS conectada a rutas relativas /api
├── ms-usuarios/             # Autenticación, emisión de tokens JWT y gestión de usuarios
├── ms-clientes/             # Gestión de clientes (distribuidores y comercios)
├── ms-productos/            # Catálogo de productos agroindustriales
├── ms-pedidos/              # Gestión de pedidos (consulta ms-clientes y ms-productos)
├── ms-lotes/                # Control de lotes de producción (consulta ms-productos)
└── README.md                # Documentación general y guía de despliegue paso a paso
```
3. Guía de Despliegue Paso a Paso en el AmbienteA. Base de datos y DNS en servidorUbuntu1 (172.16.0.197)Configurar en /etc/mysql/mysql.conf.d/mysqld.cnf la escucha en 127.0.0.1 y la IP de servidorUbuntu1:
Ini, TOMLbind-address = 127.0.0.1,172.16.0.197
Reiniciar MySQL y permitir el puerto 3306/tcp únicamente desde servidorUbuntu2 (172.16.0.198):   Bashsudo systemctl restart mysql
sudo ufw allow from 172.16.0.198 to any port 3306 proto tcp
Crear las bases de datos y los usuarios restringidos a @'172.16.0.198' usando deploy/init_databases.sql (asignando las contraseñas al momento de ejecutar en el servidor, nunca en el repositorio).   Agregar el registro A para app apuntando a 172.16.0.198 en la zona directa de bind9, incrementar el serial, verificar con named-checkzone y recargar bind9.   B. Microservicios (systemd) en servidorUbuntu2 (172.16.0.198)Instalar Node.js LTS (22.x) y git, crear el usuario del sistema nodeapps y clonar el repositorio en /srv/agrored/app:   Bashsudo adduser --system --group --no-create-home nodeapps
sudo mkdir -p /srv/agrored/app && sudo chown vagrant:vagrant /srv/agrored/app
git clone [https://github.com/casierra11/AGRORED-NOCTURNO-G2.git](https://github.com/casierra11/AGRORED-NOCTURNO-G2.git) /srv/agrored/app
Desde servidorUbuntu2, cargar el schema.sql de cada microservicio a su respectiva base de datos en 172.16.0.197.   En cada carpeta de microservicio (ms-usuarios, ms-clientes, ms-productos, ms-pedidos, ms-lotes):Bashcd /srv/agrored/app/<microservicio>
npm ci --omit=dev
cp .env.example .env
nano .env
chmod 640 .env && sudo chgrp nodeapps .env
(Asegurarse de que DB_HOST=172.16.0.197, que JWT_SECRET sea el mismo en todos los microservicios y que las URLs internas apunten a 127.0.0.1:300X).   Copiar las unidades .service desde deploy/ a /etc/systemd/system/, recargar systemd y habilitar los servicios (desplegando primero ms-usuarios):   Bashsudo cp /srv/agrored/app/deploy/ms-*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ms-usuarios ms-clientes ms-productos ms-pedidos ms-lotes
Verificar que ufw en servidorUbuntu2 mantenga abiertos únicamente 22/tcp y 80/tcp (los microservicios escuchan solo en 127.0.0.1).   C. API Gateway y Frontend en Apache (servidorUbuntu2)Habilitar proxy y proxy_http, copiar deploy/app.conf a /etc/apache2/sites-available/app.conf, validar sintaxis y recargar Apache:   Bashsudo a2enmod proxy proxy_http
sudo cp /srv/agrored/app/deploy/app.conf /etc/apache2/sites-available/app.conf
sudo a2ensite app.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
Copiar los archivos del frontend a /var/www/app/:   Bashsudo mkdir -p /var/www/app
sudo cp -r /srv/agrored/app/frontend/* /var/www/app/
Cambiar la contraseña del usuario administrador inicial (PUT /api/usuarios/1) y crear los usuarios de prueba correspondientes a cada rol.   Ejecución local en desarrollo (PC)Para probar un microservicio de forma local en desarrollo (por ejemplo, en ms-pedidos), instala dependencias con npm install, crea el archivo .env a partir de .env.example y ejecuta npm run dev.
