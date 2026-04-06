# CONTEXTO TÉCNICO COMPLETO - PORTAL OCGC

Este documento contiene el estado maestro y la arquitectura técnica de la aplicación web de la **Orquesta Comunitaria de Gran Canaria (OCGC)**. Está diseñado para ser leído por agentes IA y desarrolladores, priorizando las reglas de negocio, modelos estructurales y las recientes migraciones críticas de la app.

---

## 1. Stack Tecnológico Estabilizado (¡CRÍTICO!)
Tras resolver graves problemas de compilación Serverless en Vercel, el entorno se ha "blindado" en el siguiente equilibrio de versiones:
- **Framework**: Next.js `15.1.0` (App Router estricto). Se ha migrado `middleware.ts` a `proxy.ts` para conformar las nuevas reglas de protección.
- **Autenticación**: Clerk (v7.x). Requiere obligatoriamente Next 15.x. Clerk maneja los datos sensibles de Roles Especiales vía `user.publicMetadata`.
- **Base de Datos**: PostgreSQL alojado en [Neon Database].
- **ORM (LEER CON ATENCIÓN)**: `Prisma v6.2.1`. 
  - **RESTRICCIÓN ABSOLUTA**: **NO actualizar a Prisma 7**. La v7 genera un error `P1012` y rompe el entorno WASM de Vercel si detecta un archivo de configuración extra o inicialización dinámica.
  - La URL se saca **estrictamente** del archivo `schema.prisma` (`url = env("DATABASE_URL")`). El archivo `prisma.config.ts` ha sido destruido y neutralizado a propósito.
- **Almacenamiento**: Vercel Blob (para PDF Partituras).
- **Librerías Adicionales Recientes**: `recharts` (gráficos), `papaparse` (Importación CSV).

---

## 2. Lógica Base: Motor de "Cruce de Etiquetas"
La web no funciona con tablas relacionales típicas para asignar partituras a usuarios. Funciona por metadatos (Roles):
- El **Perfil del Músico** (Clerk) tiene un array de Etiquetas: (p.ej. `["Violonchelo", "Orquesta - Tutti"]`).
- La **Partitura** (`Score` en Prisma) tiene permitidos esos roles: (p.ej. `["Violonchelo"]`).
- Si ambas matrices tienen al menos una intersección, la partitura es visible en `/miembros/repositorio`.
- **Reglas Especiales**:
  - `Master`: Tiene poder absoluto, visualiza toda la DB sin excepción y accede a `/miembros/gestion`.
  - `Archivero`: No visualiza todas las partituras, pero tiene el derecho de entrar a `/miembros/gestion` para subir, editar y borrar documentos.
  - `General Orquesta/Coro` (Jefes o Subdirectores): Si un Admin le asigna esta etiqueta manualmente a un miembro, podrá ver las Partituras "Generales" o "Guiones" que se suban marcadas específicamente para los líderes.
  - El switch de Base de Datos `isDocument`: Si la partitura es de tipo Documento, TODO músico logueado podrá verla (usado para calendarios anuales o normativas éticas).

---

## 3. Topología de Pantallas y Componentes (Admin)
La central nuclear de todo esto se encuentra en **`app/miembros/gestion/page.tsx`**. Debido al rápido aumento de funcionalidades, el archivo principal actúa de router visual, cargando e integrando micro-componentes especializados ubicados en `components/admin/`:

1. **Gestión Clásica (Integrada en `page.tsx`)**:
   - Subida de PDFs vía Vercel Blob.
   - Listado y control de usuarios (`filteredMembers`), gestión de rangos y _Baneos_ (impide acceso total destructivo).
   - Generación de Invitaciones base.
   - **Exportación de Miembros**: Implementada bajo un generador Blob (Excel/CSV) que empaqueta las dependencias en tiempo real sin llamar al Servidor, usando los datos ya filtrados en pantalla.

2. **`DashboardPanel.tsx` (Estadísticas)**:
   - Panel de rendimiento en tiempo real impulsado por Recharts. 
   - Depende de la API `/api/admin/dashboard` que realiza un consolidado (counts y groupBy) sobre entidades del Sistema: conteo de Músicos agrupados (instrumentos/secciones), total general y conteo de obras documentadas.

3. **`CalendarPanel.tsx` (Eventos)**:
   - Controlador del **nuevo Modelo `Event`**. Clasifica en `Concierto` (etiquetas rojas urgentes) o `Ensayo` (Azules).
   - Servido vía `/api/admin/events`. Formulario integrado que permite agregar y repintar instantáneamente los próximos hitos.

4. **`LogsPanel.tsx` (Trazabilidad y Auditoría)**:
   - Se encarga de mostrar un listado inmutable desde la API `/api/admin/logs`.
   - Se nutre del **nuevo modelo `ActivityLog`** en Prisma. Cada acción que un Master realiza (Subir Obra Batch, Generar un Evento de Calendario), deja una estela sobre 'Qué', 'Cuándo' y el ID exacto en 'Clerk' de quién cometió el cambio.

5. **`CSVImportScores.tsx` (Sincronización de Archivo de Papel a Digital)**:
   - Extrae el peso del Backend realizando `papaparse` nativo en Frontend.
   - Transforma los datos y las etiquetas de coma separada para inyectarlos secuencialmente a su propio endpoint dedicado (`/api/scores/create-batch/route.ts`). Muy robusto en caso de caída en una línea intermedia, guarda un Audit Log al concluir.

---

## 4. Evolución del Sistema Criptográfico: Invitaciones Seguras
El registro fue totalmente blindado con un método que debe seguir siendo respetado.

**El Flujo:**
1. `/registro-usuarios` es inalcanzable sin url firmada o código válido.
2. Desde la pestaña *Personal* (`page.tsx`), un Master activa la generación del token al crear un nuevo registro vinculando obligatoriamente las columnas: nombre + instrumento de destino.
3. Se crea el `InvitationCode` en DB.
   - **Upgrades Recientes al Modelo**: Se incluyó la capacidad de registrar qué ID (`registeredUserId`) tomó ese código, y a qué correo fue disparado teóricamente (`sentToEmail`).
   - Sigue usando entropía alta pura (32 char. hexadecimales en 128 bytes - `crypto.randomBytes()`).
4. Cuando el onboarding natural es cumplido la ficha caduca de pleno (`usedAt` inyectado), evitando flood de bots, links compartidos ilegalmente y suplantaciones.

---
**NOTA PARA LA IA**:
Este documento asegura que entiendas que la estructura fundamental está estable. Tienes libertad para manipular el UI, pero SIEMPRE vigila la versión de Prisma (`^6.2.1`) y mantén presente que las reglas de visibilidad visual radican en `publicMetadata` de Clerk incrustado en el lado del servidor y no en estructuras relacionales duras de DB.
