# Orquesta Comunitaria de Gran Canaria — Portal Web y Administrativo

Este repositorio contiene el ecosistema digital completo de la **Orquesta Comunitaria de Gran Canaria (OCGC)**. El proyecto comprende la página web informativa (pública) y el ecosistema de Intranet para miembros y personal de gestión (privada), permitiendo un control centralizado de usuarios, archivo digital de partituras (repositorio de atriles) y herramientas avanzadas de administración (auditoría, dashboards gráficos y calendario de eventos).

---

## 1. Stack y Arquitectura Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (Versión >=14, estricto App Router).
- **Control de Temas**: Soporte integral de Modo Oscuro (Dark Mode) y Modo Claro gestionados nativamente con inyección de estado para prevenir destellos (`FOUC`). Paleta visual modulada mediante Custom Properties de CSS (`var(--clr-*)`).
- **Autenticación y Sesiones**: [Clerk](https://clerk.com/). Control de perfiles web usando Webhooks para sincronización transparente.
- **Base de Datos**: PostgreSQL via [Neon Tech](https://neon.tech/).
- **ORM**: [Prisma](https://www.prisma.io/) (fijado a `v6.2.1` por compatibilidad en Edge runtimes).
- **Storage Digital (Cloud)**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) para la distribución de partituras en PDF de extrema alta disponibilidad y baja latencia.

---

## 2. Estructura de Directorios

La estructura de este repositorio se ha reorganizado y profesionalizado con el fin de mejorar la experiencia de desarrollo a largo plazo.

```text
/
├── app/                  # (App Router) Páginas públicas (inicio, conciertos) y rutas de API. Contiene el bloque protegido /miembros.
├── components/           # Componentes puramente UI y componentes de administración (Dashboards, Logs, CSV Modals, etc.).
├── css/                  # Archivos globales de estilo (Vanilla CSS). Incluye el sistema maestro de variables y modos de color.
├── docs/                 # Documentación técnica extendida del proyecto.
│   ├── CONTEXTO_TECNICO_OCGC.md 
│   ├── GUIA_IMPORTACION_PARTITURAS.md 
│   ├── README_ETIQUETAS.md 
│   └── TEST_ESTRES_OCGC.md
├── lib/                  # Código modular backend (Conectores Prisma, Prisma Clients).
├── prisma/               # Definición maestro de esquemas `schema.prisma`.
├── public/               # Assets estáticos servidos directamente (fuentes, logos, iconos PWA).
├── scripts/              # Scripts NodeJS de utilidad, reseteo, arreglos de DB y migraciones fuera del ciclo web.
└── middleware.ts         # Orquestación de Edge Middleware de Auth para rutas públicas vs privadas.
```

---

## 3. Topología de Datos (Prisma)

- **User**: Perfil personal sincronizado automáticamente con los eventos Webhooks de Clerk.
- **Score (Partituras)**: Archivos alojados en Vercel Blob vinculados bajo etiquetas dinámicas (`allowedRoles`) de seguridad.
- **Category (Programas)**: Agrupaciones o Conciertos contenedores de las partituras.
- **Seccion / Estructura**: Base de conocimiento que agrupa la naturaleza asociativa de un músico (ej. "Trompeta" -> "Banda Sinfónica").
- **ActivityLog**: Registro de auditorías de alto nivel para todas las gestiones de administradores.
- **Event**: Objeto en agenda para gestionar convocatorias musicales.
- **InvitationCode**: Tokens efímeros (alta encriptación de 128-bit, 7 días de caducidad) que funcionan como filtro *previo* al alta de Clerk para admitir músicos orgánicamente.

---

## 4. Paneles y Funcionalidades Administrativas (`/miembros/gestion`)

El centro neurálgico del organigrama directivo reside en el panel protegido de `Master`:

- **Dashboard Panel**: Monitor en tiempo real alimentado con `recharts` para evaluar el balanceo de músicos y la densidad poblacional en cada tipo de agrupación.
- **Importadores Masivos CSV/Excel**: Integración mediante `papaparse` que inyecta cientos de usuarios y partituras en paralelo consumiendo mínimos recursos en el Edge Server.
- **Panel de Actividades y Novedades (`Tablón`)**: Herramienta enfocada al músico, filtrando notificaciones y material según su etiqueta ("Trompa Tutti", "Coro Soprano", etc.).
- **Auditoría Transaccional**: Toda acción delegada de los mánager queda debidamente firmada en el módulo de logs (fecha, acción, emisor).

El enrutamiento no es jerárquico tradicional; sigue un esquema de acceso por intersección de dependencias y de etiquetas, proporcionando a los directores el pase absoluto y a los componentes su partición de atril (tutti y seccional).

---

## 5. Operaciones Frecuentes Mantenimiento

**Scripts disponibles:**
Las herramientas manuales (ej: restauraciones) se ubican bajo la carpeta `scripts/`.
Para ejecutar scripts locales como parches manuales usa simplemente Node sin comprometer tu Vercel:
`node scripts/fix_instrumentos.js`

**Actualización Prisma (Edge Provider):**
Por las particularidades de `Vercel Edge`, al usar Prisma es conveniente que `DATABASE_URL` apunte a la infraestructura Neon, absteniéndose de usar `prisma.config.ts`. Si se agrega un nuevo modelo a `schema.prisma`:
1. `npx prisma db push`
2. `npx prisma generate`

**Cambio Visual e Identitario:**
La inyección dinámica soporta nativamente `<html data-theme="dark">`. Los ajustes de contraste residen en `/css/styles.css`.
Las directivas Google Fonts (`Montserrat Alternates`, `Inter`) pueden puentearse desde `/app/layout.tsx` en el componente head.

---
**Proyecto diseñado íntegramente por y para la Orquesta Comunitaria de Gran Canaria.**
