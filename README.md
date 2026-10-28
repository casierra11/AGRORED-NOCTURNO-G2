# AgroRed - Grupo Nocturno G2 (`agrored-nocturno-g2`)

Aplicación web distribuida basada en microservicios para la gestión agroindustrial y de distribución de AgroRed.

## Integrantes del Grupo

| Integrante | Usuario de GitHub | Microservicio a cargo |
| :--- | :--- | :--- |
| Juan Camilo Casierra Riascos | `casierra11` | `ms-pedidos` |
| Brandon Montilla Hernández | `Brandon1927` | `ms-productos` |
| Juan David Rios Gallego | `JDRios17` | `ms-clientes` |
| Víctor Manuel Salazar Chaparro | `VictorSalazar30` | `ms-lotes` (y sensores) |

---

## Tabla de Microservicios

| Carpeta | Entidad | Responsable | Puerto | Depende de (Referencias) |
| :--- | :--- | :--- | :--- | :--- |
| `ms-usuarios` | Usuario | Docente | 3001 | Ninguno |
| `ms-productos` | Productos | Brandon Montilla (`Brandon1927`) | 3002 | Ninguno |
| `ms-clientes` | Clientes | Juan David Rios (`JDRios17`) | 3003 | Ninguno |
| `ms-pedidos` | Pedidos | Juan Camilo Casierra (`casierra11`) | 3004 | Clientes, Productos |
| `ms-lotes` | Lotes y Sensores | Víctor Manuel Salazar (`VictorSalazar30`) | 3005 | Productos |

---

## Estructura del Repositorio

El repositorio se encuentra organizado de la siguiente manera:

```text
agrored-nocturno-g2/
├── README.md            # Documentación general del proyecto y del grupo
├── ms-usuarios/         # Microservicio común de usuarios (proporcionado por la docente)
├── ms-productos/        # Microservicio de gestión de productos de la agroindustria
├── ms-clientes/         # Microservicio de gestión de clientes y comercios
├── ms-pedidos/          # Microservicio de gestión de pedidos (Capa en Node.js + Express)
├── ms-lotes/            # Microservicio de gestión de lotes de producción y sensores
├── frontend/            # Interfaz web de usuario y vistas por rol
└── deploy/              # Archivos de configuración de despliegue y red
```
---

### Cómo ejecutar un microservicio
Para poner a marchar un microservicio, se deben seguir los pasos de ejecutar `npm install` para instalar las dependencias necesarias, crear el archivo `.env` configurando las variables de entorno requeridas, y finalmente iniciar el servidor ejecutando el comando `npm run dev`.
