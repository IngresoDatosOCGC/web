# Guía de Test de Estrés y Funcionalidad — Plataforma OCGC

Este documento detalla el escenario de prueba necesario para validar el 100% de la lógica de negocio, especialmente el sistema de **cruce de etiquetas** y **seguridad basada en roles**.

---

## 1. Muestra de Usuarios (Plantilla de Prueba)
Configura los siguientes perfiles en el panel de Gestión / Clerk para cubrir todas las casuísticas:

*   **2 Usuarios "Músico Base" (Orquesta)**: Ej: Un _Violín 1º_ y un _Oboe_. Solo deben ver sus partituras específicas y las etiquetadas como `Orquesta - Tutti`.
*   **2 Usuarios "Músico Base" (Coro)**: Ej: Una _Soprano_ y un _Tenor_. Solo deben ver el material de Coro.
*   **2 Usuarios "Músico Multi-Ensemble"**: Ej: Un trompetista que esté asignado a `Orquesta` y también a `Big Band`. Debe ver el material de ambos grupos mezclado en su repositorio.
*   **2 Usuarios "Jefes de Sección"**: Un `General Orquesta` (ej. el Concertino) y un `General Coro`. Deben ver sus instrumentos + el material marcado como "General" que los músicos base tienen bloqueado.
*   **1 Usuario "Archivero"**: Para probar que puede entrar a Gestión (Admin), pero que en su Repositorio personal solo ve sus partituras de instrumento.
*   **1 Usuario "Master" (Director)**: Para verificar que ve el 100% de los PDFs sin importar las etiquetas o filtros.
*   **1 Usuario "Baneado"**: Para confirmar que al intentar entrar, el middleware/proxy le expulsa de la sesión inmediatamente.

---

## 2. Muestra de Partituras y Documentos (CSV de Importación)
Prepara un archivo `.csv` con 20-25 entradas repartidas en estas "casuísticas trampa":

| Tipo | Cantidad | Tags (allowedRoles) | Lógica de Prueba |
| :--- | :--- | :--- | :--- |
| **Instrumento Único** | 5 | `Violín`, `Oboe`, `Soprano`, etc. | Deben ser privadas para el resto. |
| **Sección (Shared)** | 2 | `Trombón`, `Tuba`, `Bombardino` | 1 archivo visible para 3 instrumentos distintos. |
| **Programas** | 3 | Variados | Probar búsqueda por "Gala Lírica", "Sinfónico Mayo", etc. |
| **Guiones de Dirección** | 2 | `General Orquesta` | Solo visibles para Jefes y Master. |
| **Docs. Comodín** | 2 | *(check isDocument)* | Visibles para todos los usuarios logueados. |
| **Material Ensayo** | 1 | `Coro - Tutti` | Los de la Orquesta NO deberían verlo. |

---

## 3. Calendario (Prueba de Eventos)
Crea 5 eventos repartidos en los próximos 15 días:

1.  **3 Ensayos (Azules)**: Ponlos en días seguidos para verificar si el calendario gestiona bien los bloques de tiempo sin amontonarlos visualmente.
2.  **2 Conciertos (Rojos)**: Para validar el contraste visual prioritario en el tablón de anuncios de los músicos.

---

## 4. Qué observar durante la prueba

### A. El "Muro de Pago" Visual
Logueate como el usuario "Oboe". Navega por el repositorio y asegúrate de que:
*   No aparecen las partituras de "Violín".
*   No aparece el "Guion de Dirección" (General Orquesta).
*   Sí aparecen los "Documentos Comodín".

### B. Importación Masiva
Usa el panel de gestión para subir el CSV con 10 archivos de una sola vez. Verifica:
*   Si el sistema mapea correctamente las categorías (Programas) leyendo el texto del CSV.
*   Si los archivos se asocian a los roles indicados.

### C. Logs de Auditoría
Finalmente, entra como **Master** a la pestaña "Logs":
*   Verifica que cada subida, borrado o edición realizada durante el test ha quedado registrada con el nombre del autor y la fecha exacta.

---
*Fin del Plan de Test*
