# CONTEXTO TÉCNICO COMPLETO - PORTAL OCGC

Este documento contiene el estado maestro y la arquitectura técnica de la aplicación web de la **Orquesta Comunitaria de Gran Canaria (OCGC)**. Está diseñado para ser leído por agentes IA y desarrolladores, priorizando las reglas de negocio, modelos estructurales y las últimas actualizaciones de la plataforma.

---

## 1. Stack Tecnológico Estabilizado (¡CRÍTICO!)

El entorno se consolidó tras la migración completa a Supabase:

- **Framework**: Next.js `15.x` (App Router).
- **Autenticación**: **Supabase Auth**.
  - Los roles y permisos se gestionan en la tabla `User` (Fuente de Verdad) y se sincronizan con `app_metadata` de Supabase (Caché rápida en JWT).
  - La sincronización ocurre mediante `lib/supabase-sync.ts → syncUserMetadata(dbId)`.
  - **Login dual**: El usuario puede autenticarse con su email O con su `username` (alias). La resolución ocurre en `/api/auth/resolve-identifier` antes de llamar a Supabase Auth.
- **Base de Datos**: PostgreSQL alojado en **Supabase**.
- **ORM**: **Prisma v6.2.x** — Antes de cambios de esquema: `npx prisma db push && npx prisma generate`.
- **Almacenamiento**: Supabase Storage / Vercel Blob para PDFs.
- **Visuales**: Sistema de diseño Vanilla CSS con variables dinámicas (`css/miembros.css`, `css/styles.css`).

---

## 2. Lógica Base: Motor de "Cruce de Etiquetas"

La visibilidad de recursos (partituras, anuncios) se basa en la intersección de etiquetas:

- **Usuario**: Tiene etiquetas derivadas de sus `Estructura` activas (ej: `["Violín primero", "Orquesta"]`).
- **Recurso (Score)**: Define en `allowedRoles[]` qué secciones tienen acceso.
- **Permisos Especiales**:
  - `isMaster` → Acceso total a la gestión y a todos los recursos.
  - `isArchiver` → Permiso para gestionar el archivo de partituras.
  - `isSectionLeader` → Acceso a la vista `/miembros/seccion` para gestionar atriles de su sección.
  - `isSeller` → Permiso para gestionar ventas o servicios externos.

---

## 3. Topología de Pantallas y Componentes (Admin)

El centro neurálgico reside en `app/miembros/gestion/GestionPageClient.tsx`, orquestrador de pestañas:

| Componente | Descripción |
| :--- | :--- |
| `DashboardPanel.tsx` | Estadísticas con Recharts. Consume `/api/admin/dashboard`. |
| `PersonalPanel.tsx` | Gestión completa de usuarios: roles, invitaciones, baneos, edición de estructuras. **Implementa carga diferida**: la tabla carga resúmenes ligeros y el modal de edición lanza una petición adicional por usuario para obtener datos completos. |
| `CalendarPanel.tsx` | Gestión de eventos (Ensayo, Concierto, Reunión). Modelo `Event`. |
| `RequestsPanel.tsx` | Gestión de solicitudes de nuevos miembros (`JoinRequest`). |
| `CSVImportUsers.tsx` | Importación masiva de músicos (ver `docs/GUIA_IMPORTACION_MIEMBROS_CSV.md`). |
| `CSVImportScores.tsx` | Importación masiva de partituras (ver `docs/GUIA_IMPORTACION_PARTITURAS.md`). |
| `LogsPanel.tsx` | Trazabilidad del sistema mediante el modelo `ActivityLog`. |
| `SectionsPanel.tsx` | Gestión del catálogo de agrupaciones, secciones y papeles. |

---

## 4. Sistema de Invitaciones y Registro

1. **Generación**: Un Admin (Master) genera un código desde el panel Personal, vinculado a nombre y sección.
2. **Validación**: El invitado usa el código en `/registro-usuarios`.
3. **Registro**: Se crea la cuenta en Supabase Auth y se vincula al registro previo en la DB local.
4. **Resolución de Identidad**: El sistema permite login por `username` o `email` mediante `/api/auth/resolve-identifier`.

---

## 5. Gestión de Usuarios: Flujo Completo

### Creación de Usuarios
Hay cuatro vías para crear un usuario:
1. **Invitación**: El músico se auto-registra mediante un enlace único.
2. **Formulario Público** (`/unete`): El músico envía una solicitud de admisión.
3. **Creación Manual** (Admin): El panel de Personal tiene un formulario para crear usuarios individuales.
4. **Importación CSV**: Carga masiva desde un fichero CSV (ver guía completa en `docs/GUIA_IMPORTACION_MIEMBROS_CSV.md`).

### Usuarios Externos
Un usuario marcado como `isExternal: true` **no tiene acceso a la plataforma**. Solo existe en la base de datos para gestión interna (listas de plantilla, atriles). Los usuarios sin email se crean como externos automáticamente.

### Prefijo `ext_`
Los usuarios sin cuenta en Supabase (externos) se identifican con el prefijo `ext_` seguido de su `id` de base de datos (ej: `ext_42`). Esto les diferencia de los usuarios con `supabaseUserId` en todas las operaciones de la API.

---

## 6. API de Usuarios Admin: Carga Diferida (`/api/admin/users`)

La API implementa **dos modos de respuesta** para optimizar el rendimiento:

### GET sin parámetros → Resumen para tabla
Devuelve solo los campos necesarios para mostrar la tabla de miembros. No incluye DNI, teléfono ni estructuras completas. Rápido y ligero.

### GET `?id={userId}` → Detalle completo para modal
Se usa `findUnique` (más rápido que `findFirst`) sobre el campo indexado (`id` o `supabaseUserId`). Devuelve el perfil completo incluyendo estructuras artísticas, DNI y teléfono.

### POST → Acciones de gestión
Las acciones disponibles son: `toggle-ban`, `toggle-master`, `toggle-archiver`, `toggle-seller`, `toggle-section-leader`, `update-user`, `update-estructura`, `add-estructura`, `delete-estructura`, `upgrade-to-platform`.

---

## 7. Notas para Mantenimiento e IA

- **Prisma**: Antes de cualquier cambio de esquema, ejecutar `npx prisma db push` y `npx prisma generate`.
- **Auth Context**: Utilizar siempre el hook `useSupabaseAuth()` para acceder al estado de sesión y perfil extendido.
- **CSS**: Los estilos de administración están centralizados en `css/miembros.css`. Mantener la estética "Premium Navy/Gold" de la OCGC.
- **`export const dynamic = 'force-dynamic'`**: Obligatorio en todos los endpoints de administración para evitar que Next.js cachee respuestas que deben ser siempre frescas.
- **Sincronización Auth**: Tras cualquier cambio de rol en la DB, llamar siempre a `syncUserMetadata(dbId)` para actualizar la caché de Supabase y propagar los permisos en tiempo real.

---

## 8. Índice de Documentación Técnica (`/docs`)

| Documento | Descripción |
| :--- | :--- |
| `CONTEXTO_TECNICO_OCGC.md` | Este archivo. Estado maestro de la arquitectura. |
| `GUIA_IMPORTACION_MIEMBROS_CSV.md` | Guía completa para importar músicos masivamente por CSV. |
| `GUIA_IMPORTACION_PARTITURAS.md` | Guía para la carga masiva de partituras en PDF. |
| `GUIA_JEFES_SECCION.md` | Funcionalidades del rol Jefe de Sección (Drag & Drop de atriles). |
| `GUIA_ROLES_RBAC.md` | Cómo añadir nuevos roles al sistema de permisos. |
| `README_ETIQUETAS.md` | Sistema de etiquetas para visibilidad de partituras. |
| `TEST_ESTRES_OCGC.md` | Procedimientos de prueba de carga del sistema. |

---
**Documento actualizado a Abril de 2026.**
