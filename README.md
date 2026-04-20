# Orquesta Comunitaria de Gran Canaria — Portal Web y Administrativo

Este repositorio contiene el ecosistema digital completo de la **Orquesta Comunitaria de Gran Canaria (OCGC)**. El proyecto comprende la página web informativa (pública) y el ecosistema de Intranet para miembros y personal de gestión (privada), permitiendo un control centralizado de usuarios, archivo digital de partituras (repositorio de atriles) y herramientas avanzadas de administración.

---

## 1. Stack y Arquitectura Tecnológica

| Capa | Tecnología | Notas |
| :--- | :--- | :--- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) | Serverless en Vercel |
| Autenticación | [Supabase Auth](https://supabase.com/auth) | Login por email **o username** |
| Base de Datos | PostgreSQL via [Supabase](https://supabase.com/) | — |
| ORM | [Prisma v6.2.x](https://www.prisma.io/) | Fuente de verdad de roles |
| Styling | Vanilla CSS (variables premium Navy/Gold) | `css/styles.css` y `css/miembros.css` |
| Storage | Supabase Storage / Vercel Blob | PDFs de partituras |
| Despliegue | [Vercel](https://vercel.com/) | CI/CD automático desde `main` |

---

## 2. Estructura de Directorios

```text
/
├── app/                  # (App Router) Rutas públicas, privadas (/miembros) y APIs.
│   ├── api/              # Endpoints serverless (admin, auth, scores, events…)
│   ├── miembros/         # Intranet privada (tablon, gestion, seccion)
│   └── sign-in/          # Login con resolución de username → email
├── components/
│   ├── admin/            # Paneles de administración (Personal, Partituras, Calendario…)
│   └── ui/               # Componentes de interfaz compartidos (Notificaciones, Modales)
├── css/                  # Sistema de diseño (público y miembros).
├── docs/                 # Documentación técnica y guías operativas (ver índice abajo).
├── lib/                  # Utils, conectores Prisma, contextos Auth y UI.
├── prisma/               # Esquema de base de datos (schema.prisma).
├── public/               # Assets estáticos (logos, fuentes corporativas).
└── middleware.ts         # Protección de rutas mediante Supabase Auth Middleware.
```

---

## 3. Modelos de Datos (Prisma)

| Modelo | Descripción |
| :--- | :--- |
| `User` | Perfil del miembro. Roles booleanos: `isMaster`, `isArchiver`, `isSeller`, `isSectionLeader`. Identificador dual: `supabaseUserId` (cuenta activa) o prefijo `ext_` (externo). |
| `Estructura` | Relación Usuario–Agrupación–Sección–Papel. Un músico puede tener múltiples estructuras (varios instrumentos/agrupaciones). |
| `Score` | Partituras y documentos. Acceso controlado por `allowedRoles[]` y `allowedAgrupaciones[]`. |
| `Category` | Programas/Conciertos. Agrupan partituras. |
| `Event` | Calendario oficial (Ensayo, Concierto, Reunión). |
| `JoinRequest` | Solicitudes de admisión de nuevos músicos vía `/unete`. |
| `InvitationCode` | Tokens de registro único para invitados. |
| `ActivityLog` | Auditoría de acciones administrativas. |
| `InvitationCode` | Tokens de registro único para invitados. |
| `Residencia` / `Empleo` | Datos de residencia y situación laboral. |

---

## 4. Sistema de Autenticación y Login

Los usuarios pueden iniciar sesión en `/sign-in` usando:
- **Correo electrónico** (campo `email` en Supabase Auth).
- **Nombre de usuario** (`username` en la BD local), que por defecto es el DNI en mayúsculas del músico.

El flujo resuelve el identificador antes de llamar a Supabase: `/api/auth/resolve-identifier` busca el campo `username` en la base de datos y retorna el email asociado.

> **Contraseña inicial** de usuarios importados o creados manualmente: su **DNI en mayúsculas** (ej: `12345678A`). Se recomienda cambiarla desde `/forgot-password`.

---

## 5. Funcionalidades Administrativas (`/miembros/gestion`)

| Pestaña | Descripción |
| :--- | :--- |
| **Dashboard** | Estadísticas visuales en tiempo real (Recharts): distribución de músicos por sección, ratio activos/inactivos, etc. |
| **Personal** | Gestión completa de usuarios: roles, estructuras artísticas, invitaciones, baneos y permisos. Soporta importación masiva por CSV y creación manual. |
| **Partituras** | Subida, categorización y visibilidad de documentos. Importador masivo de PDFs. |
| **Programas** | Gestión de programas de concierto (categorías de partituras). |
| **Estructuras** | Administración del catálogo de agrupaciones, secciones, instrumentos y papeles. |
| **Agenda** | Calendario de ensayos y conciertos con publicación de citaciones. |
| **Solicitudes** | Buzón de candidatos que aplican vía formulario público `/unete`. |
| **Logs** | Trazabilidad de todas las acciones administrativas del sistema. |

---

## 6. Flujos de Incorporación de Músicos

Existen cuatro vías para dar de alta a un músico:

1. **🔗 Invitación** — El admin genera un enlace único desde el panel Personal. El músico lo abre y completa su registro.
2. **📋 Formulario público** — El candidato rellena el formulario en `/unete`. El admin evalúa la solicitud desde el buzón.
3. **👤 Alta manual** — El admin crea directamente el usuario desde el panel Personal (útil para músicos sin correo electrónico o externos).
4. **📤 Importación CSV** — Carga masiva desde fichero Excel/CSV. Ver [Guía Completa de Importación CSV](./docs/GUIA_IMPORTACION_MIEMBROS_CSV.md).

---

## 7. Documentación Técnica

| Documento | Descripción |
| :--- | :--- |
| [`CONTEXTO_TECNICO_OCGC.md`](./docs/CONTEXTO_TECNICO_OCGC.md) | Arquitectura completa, API y patrones de implementación. Lectura obligatoria para cualquier desarrollo. |
| [`GUIA_IMPORTACION_MIEMBROS_CSV.md`](./docs/GUIA_IMPORTACION_MIEMBROS_CSV.md) | Guía completa: columnas aceptadas, ejemplos y lógica de idempotencia del importador CSV. |
| [`GUIA_IMPORTACION_PARTITURAS.md`](./docs/GUIA_IMPORTACION_PARTITURAS.md) | Guía para la carga masiva de partituras (PDFs + CSV de metadatos). |
| [`GUIA_JEFES_SECCION.md`](./docs/GUIA_JEFES_SECCION.md) | Funcionalidades del rol Jefe de Sección (gestión de atriles con Drag & Drop). |
| [`GUIA_ROLES_RBAC.md`](./docs/GUIA_ROLES_RBAC.md) | Procedimiento paso a paso para añadir nuevos roles al sistema de permisos. |
| [`README_ETIQUETAS.md`](./docs/README_ETIQUETAS.md) | Sistema de etiquetas para controlar la visibilidad de partituras por sección. |

---

## 8. Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (copiar y rellenar)
cp .env.local.example .env.local

# 3. Sincronizar cliente Prisma con el esquema
npx prisma generate

# 4. Aplicar cambios del esquema a la base de datos (si hay migraciones)
npx prisma db push

# 5. Iniciar servidor de desarrollo
npm run dev
```

**Variables de entorno requeridas** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
```

---

## 9. Despliegue

El proyecto está optimizado para **Vercel** con soporte nativo para funciones serverless. El despliegue se realiza automáticamente al hacer push a la rama `main`.

> **Nota**: El script `postinstall` ejecuta `prisma generate` automáticamente en cada build de Vercel.

---
*Proyecto diseñado íntegramente por y para la Orquesta Comunitaria de Gran Canaria. · Abril 2026.*
