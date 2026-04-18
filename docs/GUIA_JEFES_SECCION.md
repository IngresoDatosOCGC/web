# 👨‍💼👩‍💼 Guía de Gestión para Jefes de Sección

## Introducción
El rol de **Jefe de Sección** (`isSectionLeader`) está diseñado para descentralizar la organización de las agrupaciones musicales de la OCGC. Los usuarios con este rol tienen acceso a una vista exclusiva de administración (`/miembros/seccion`) en la que pueden gestionar exclusivamente a los músicos de las secciones o familias bajo su jurisdicción (p. ej., un Jefe de Viento Madera podrá gestionar oboes, flautas, clarinetes, etc. de forma unificada).

## Funcionalidades Principales

### 1. Visualización de la Plantilla
Los Jefes de Sección pueden ver en una tabla unificada a todos los músicos asignados a su familia o sección. Los administradores principales (Master) tienen acceso global a todas las agrupaciones. Si un líder tiene varias secciones bajo su mando, dispondrá de filtros desplegables para ver a toda su familia junta o separar a los músicos por su sección/instrumento específico.

### 2. Activación y Desactivación
Mediante el botón de estado (✓ o 🚫), el Jefe puede integrar o apartar temporalmente a músicos de la plantilla activa:
* **Resolución automática de conflictos (Backend):** Cuando se reactiva a una persona, el sistema comprueba en tiempo real si su último atril guardado en base de datos está siendo utilizado actualmente por otro miembro activo de su misma sección. Si existe un conflicto o colisión de atril, el sistema asignará de forma automática el siguiente número disponible buscando huecos libres (incrementando `+1` recursivamente) para evitar repeticiones accidentales sin requerir la intervención humana.

### 3. Modo Reordenar de Atriles (Drag & Drop)
Para asignar el orden final de los números de atril, se ha implementado una herramienta interactiva moderna:
1. Al usar los filtros para aislar una **sección específica**, se habilitará el botón **"⇕ Modo Reordenar"**.
   *(Nota: Se bloquea intencionadamente al visualizar varias secciones mezcladas para prevenir errores de indexación de atriles transversales).*
2. Al iniciar la reordenación:
   - Los miembros **inactivos** se agrupan automáticamente al final de la tabla (translúcidos y bloqueados visualmente).
   - Aparecen indicadores de arrastre (☰) junto a los miembros activos en la parte superior.
   - El Jefe puede **hacer clic y arrastrar (Drag and Drop HTML5)** a los músicos activos hacia arriba o hacia abajo para establecer la precedencia física que tendrán en el escenario.
   - Una advertencia de colisión notificará de la existencia de errores posicionales en BD y forzará explícita reordenación.
3. **Guardado en Lote (Batch Update):** Al pulsar "Guardar Atriles", se escanea el nuevo orden visual de la tabla y la API procesa la actualización reasignando las numeraciones de atril (`1, 2, 3...`) secuencialmente de una vez mediante una transacción múltiple en Prisma.

## Arquitectura y Componentes
- `app/miembros/seccion/page.tsx`: Estructura principal, barreras de autorización globales y orquestador del estado de miembros e interfaz de filtros.
- `components/admin/SeccionTable.tsx`: Componente de tabla aislado encargado de controlar la lógica nativa Drag-Over/Drop, prevenir interacciones erradas y mostrar superposiciones gráficas (flags de conflictos).
- `app/api/admin/seccion/route.ts`: API protegida. Las operaciones aisladas verifican jurisdicción exacta en la DB antes de aprobar modificaciones; la variante `action=batch-update-atril` reduce al mínimo el uso de recursos de servidor agrupando los PRISMA loops.
