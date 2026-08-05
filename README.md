# TallerTrack

Sistema web para gestionar clientes, equipos y órdenes de reparación en talleres técnicos.

## Descripción

TallerTrack centraliza el proceso completo de reparación de un equipo, desde su ingreso al taller hasta la entrega al cliente.

El sistema permitirá registrar clientes y dispositivos, administrar diagnósticos y presupuestos, actualizar el estado de cada reparación y mantener un historial de los cambios realizados.

Los clientes podrán consultar el avance de su reparación mediante un enlace privado, sin necesidad de crear una cuenta.

## Problema que resuelve

Muchos talleres técnicos administran sus reparaciones mediante papel, planillas de cálculo o conversaciones de WhatsApp.

Esto puede provocar:

- Pérdida de información.
- Falta de seguimiento de los equipos.
- Confusión sobre presupuestos y pagos.
- Dificultad para comunicar avances al cliente.
- Ausencia de un historial de reparaciones.

## Funcionalidades del MVP

- Registro y administración de clientes.
- Registro de equipos.
- Creación de órdenes de reparación.
- Gestión de diagnósticos.
- Creación y aprobación de presupuestos.
- Actualización del estado de las reparaciones.
- Historial de cambios de estado.
- Registro de fotografías y archivos.
- Enlace privado de seguimiento para el cliente.
- Panel de gestión para el taller.

## Flujo de una reparación

```text
Recibido
   ↓
En diagnóstico
   ↓
Esperando aprobación
   ↓
En reparación
   ↓
Listo para retirar
   ↓
Entregado
```

También se contemplarán los estados `Cancelado` y `Sin reparación`.

## Tecnologías

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- NestJS
- TypeScript

### Tecnologías planificadas

- PostgreSQL
- Prisma ORM
- Docker
- Cloudinary
- TanStack Query
- React Hook Form
- Zod

## Estructura del proyecto

```text
taller-track/
├── apps/
│   ├── api/    # API REST desarrollada con NestJS
│   └── web/    # Aplicación web desarrollada con React
├── README.md
└── .gitignore
```

## Ejecución local

### Backend

```bash
cd apps/api
npm install
npm run start:dev
```

El backend estará disponible en:

```text
http://localhost:3000
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

El frontend estará disponible en:

```text
http://localhost:5173
```

## Estado del proyecto

Proyecto actualmente en desarrollo.

### Hitos

- [x] Inicialización del frontend con React, Vite y TypeScript.
- [x] Inicialización del backend con NestJS y TypeScript.
- [ ] Conexión entre frontend y backend.
- [ ] Configuración de PostgreSQL y Prisma.
- [ ] Gestión de clientes.
- [ ] Gestión de equipos.
- [ ] Gestión de órdenes de reparación.
- [ ] Seguimiento público para clientes.
- [ ] Autenticación y permisos.
- [ ] Despliegue de la aplicación.

## Autor

Desarrollado por **Lucas Alonso**.
>>>>>>> c7bc846 (chore: initialize TallerTrack frontend and backend)
