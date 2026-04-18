# CONTEXTO TÉCNICO COMPLETO - PORTAL OCGC

Este documento contiene el estado maestro y la arquitectura técnica de la aplicación web de la **Orquesta Comunitaria de Gran Canaria (OCGC)**. Está diseñado para ser leído por agentes IA y desarrolladores, priorizando las reglas de negocio, modelos estructurales y las recientes migraciones críticas de la app.

---

## 1. Stack Tecnológico Estabilizado (¡CRÍTICO!)

El entorno se ha consolidado tras la migración a Supabase para evitar limitaciones de proveedores externos:
- **Framework**: Next.js `15.x` (App Router).
- **Autenticación**: **Supabase Auth**. 
  - Los roles y permisos se gestionan en la tabla `User` (Fuente de Verdad) y se sincronizan con `app_metadata` de Supabase (Caché rápida en JWT).
  - La sincronización ocurre vía `/api/auth/sync` y utilidades en `lib/supabase-sync.ts`.
- **Base de Datos**: PostgreSQL alojado en **Supabase**.
- **ORM**: **Prisma v6.2.x**.
  - **RESTRICCIÓN**: Mantener versiones que aseguren compatibilidad con el runtime de Vercel (evitar drivers pesados si se busca despliegue en Edge).
- **Almacenamiento**: Supabase Storage / Vercel Blob para PDFs.
- **Visuales**: Sistema de diseño basado en Vanilla CSS con variables dinámicas.

---

## 2. Lógica Base: Motor de "Cruce de Etiquetas"

La visibilidad de recursos (partituras, anuncios) se basa en la intersección de etiquetas:
- **Usuario**: Tiene etiquetas como `["Trompeta", "Orquesta - Tutti"]`.
- **Recurso**: Define qué etiquetas tienen acceso.
- **Permisos Especiales**:
  - `isMaster`: Acceso total a gestión y visualización global.
  - `isArchiver`: Permiso para gestionar el archivo de partituras (Scores).
  - `isSeller`: Permiso para gestionar ventas o servicios externos.

---

## 3. Topología de Pantallas y Componentes (Admin)

El centro neurálgico reside en `app/miembros/gestion/page.tsx`, que actúa como orquestador de pestañas cargando componentes de `components/admin/`:

1. **`DashboardPanel.tsx`**: Estadísticas con Recharts. Consume `/api/admin/dashboard`.
2. **`PersonalPanel.tsx`**: Gestión de usuarios, roles, invitaciones y baneos.
3. **`CalendarPanel.tsx`**: Gestión de eventos (Ensayo, Concierto, Reunión). Modelo `Event`.
4. **`RequestsPanel.tsx`**: Gestión de solicitudes de nuevos miembros (`JoinRequest`).
5. **`CSVImportScores.tsx` / `CSVImportUsers.tsx`**: Procesadores masivos con PapaParse.
6. **`LogsPanel.tsx`**: Trazabilidad del sistema mediante el modelo `ActivityLog`.

---

## 4. Sistema de Invitaciones y Registro

1. **Generación**: Un Admin genera un código vinculado a un nombre y sección desde el panel de gestión.
2. **Validación**: El invitado utiliza el código para acceder a `/registro-usuarios`.
3. **Registro**: Se crea la cuenta en Supabase Auth y se vincula automáticamente con el registro previo en la DB.
4. **Resolución de Identidad**: El sistema permite login por username o email mediante el servicio `/api/auth/resolve-identifier`.

---

## 5. Notas para Mantenimiento e IA

- **Prisma**: Antes de cualquier cambio de esquema, ejecutar `npx prisma db push` y `npx prisma generate`.
- **Auth Context**: Utilizar siempre el hook `useSupabaseAuth()` para acceder al estado de sesión y perfil extendido.
- **CSS**: Los estilos de administración están centralizados en `css/miembros.css`. Mantener la estética "Premium Navy/Gold" de la OCGC.

---
**Documento actualizado a Abril de 2026.**
