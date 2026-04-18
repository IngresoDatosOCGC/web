# Orquesta Comunitaria de Gran Canaria — Portal Web y Administrativo

Este repositorio contiene el ecosistema digital completo de la **Orquesta Comunitaria de Gran Canaria (OCGC)**. El proyecto comprende la página web informativa (pública) y el ecosistema de Intranet para miembros y personal de gestión (privada), permitiendo un control centralizado de usuarios, archivo digital de partituras (repositorio de atriles) y herramientas avanzadas de administración (auditoría, dashboards gráficos y calendario de eventos).

---

## 1. Stack y Arquitectura Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (Versión 15, App Router).
- **Autenticación y Sesiones**: [Supabase Auth](https://supabase.com/auth). Hemos migrado de Clerk a Supabase para un control total de la base de datos y los metadatos de usuario (`app_metadata`).
- **Base de Datos**: PostgreSQL via [Supabase](https://supabase.com/).
- **ORM**: [Prisma](https://www.prisma.io/) (v6.2.x). 
  - *Nota*: Se mantiene la compatibilidad con entornos Edge.
- **Styling**: Vanilla CSS con un sistema premium de variables (`/css/styles.css` y `/css/miembros.css`).
- **Storage**: Integración con Supabase Storage / Vercel Blob para la distribución de partituras.

---

## 2. Estructura de Directorios

La estructura de este repositorio está organizada para maximizar la modularidad y el rendimiento:

```text
/
├── app/                  # (App Router) Rutas públicas, privadas (/miembros) y APIs.
├── components/           # Componentes UI reutilizables y módulos de administración.
├── css/                  # Sistema de diseño (público y miembros).
├── docs/                 # Documentación técnica detallada y guías operativas.
├── lib/                  # Utils, conectores Prisma y contextos (Auth, UI).
├── prisma/               # Esquema de base de datos e histórico de migraciones.
├── public/               # Assets estáticos (logos, fuentes corporativas).
└── middleware.ts         # Protección de rutas mediante Supabase Auth Middleware.
```

---

## 3. Topología de Datos (Prisma)

- **User**: Perfil del miembro con roles (`isMaster`, `isArchiver`, `isSeller`) y etiquetas de sección.
- **Score (Partituras)**: Documentos musicales categorizados por programa y tags de instrumentos.
- **Category (Programas)**: Contenedores lógicos de partituras (conciertos, carpetas).
- **Event**: Calendario oficial de ensayos, reuniones y conciertos.
- **JoinRequest**: Gestión de solicitudes de nuevos músicos que desean unirse a la OCGC.
- **InvitationCode**: Tokens de registro único para invitados.
- **ActivityLog**: Sistema de auditoría para rastrear acciones administrativas.

---

## 4. Funcionalidades Administrativas (`/miembros/gestion`)

- **Dashboard**: Estadísticas visuales en tiempo real del balance de la orquesta (Recharts).
- **Gestión de Usuarios**: Control de permisos, etiquetas de sección y estados de acceso.
- **Importadores CSV**: Carga masiva de usuarios y partituras con validación en tiempo real.
- **Agenda y Calendario**: Publicación de citaciones con filtros por tipo de evento.
- **Buzón de Solicitudes**: Evaluación dinámica de candidatos que aplican vía web.

---

## 5. Operaciones de Desarrollo

**Configuración Local:**
1. Instalar dependencias: `npm install`
2. Configurar `.env` con las credenciales de Supabase y Database.
3. Actualizar Prisma: `npx prisma generate`

**Despliegue:**
El proyecto está optimizado para **Vercel**, con soporte nativo para funciones serverless y protección de rutas mediante middleware.

---
**Proyecto diseñado íntegramente por y para la Orquesta Comunitaria de Gran Canaria.**
