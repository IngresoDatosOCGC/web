# Guía Definitiva de Etiquetas y Permisos (Archivo OCGC)

Este documento detalla el funcionamiento del sistema de "cruce de etiquetas" mediante el cual se otorgan y gestionan los permisos de acceso a las partituras y documentos en el Repositorio de la Orquesta Comunitaria de Gran Canaria.

## 1. El Concepto Base: Cruce de Etiquetas

El sistema **no** usa una relación estricta en base de datos. En su lugar, utiliza un sistema de metadatos gestionados a través de Clerk.
El repositorio de cada usuario funciona inspeccionando qué etiquetas (Roles) tiene en su Perfil y qué etiquetas se le asignaron al PDF cuando el administrador lo subió.

**Regla de Oro:** Un usuario SOLO verá en su repositorio las partituras/documentos que tengan **al menos una etiqueta coincidente** con las que él tiene en su perfil. (Excepción explícita: El rol "Master" y los archivos marcados como "Documento General").

---

## 2. Etiquetado de Usuarios (El Músico)

### 2.1 Asignación Automática (Registro)
Cuando un usuario completa el formulario de alta, el sistema ejecuta una lógica automática en Clerk para asignarle sus etiquetas base:
1.  **Su Instrumento/Familia:** (Ej. `Violonchelo`, `Soprano (coro)`).
2.  **Su Agrupación Global:** Dependiendo de qué agrupación eligió, el sistema le inyecta la etiqueta `Orquesta - Tutti`, `Coro - Tutti`, `Ensemble Flautas - Tutti`, `Ensemble Metales - Tutti`, `Ensemble Chelos - Tutti` o `Big Band - Tutti`.

*Resultado:* Si un chelista se inscribe en la Orquesta, su perfil nacerá con las etiquetas: `["Violonchelo", "Orquesta - Tutti"]`.

### 2.2 Asignación Manual (Panel "Personal")
Cualquier permiso adicional más allá de ser un Músico Base debe gestionarse manualmente por un Administrador desde `/miembros/gestion` -> Pestaña **Personal**.

Aquí entran los tres grandes Roles Especiales:

#### A. Jefe de Sección / Subdirector
No es un check (como Master/Archivero), sino que funciona por etiquetas especiales.
*   **Acción:** Un administrador hace clic en "Editar" en la columna de Instrumentos de ese músico.
*   **Etiqueta a añadir:** `General Orquesta`, `General Coro`, `General Ensemble Flautas`, `General Ensemble Metales`, `General Ensemble Chelos` o `General Big Band` (según a qué agrupación pertenezca).
*   **Efecto:** Además de sus partituras normales, este Músico ahora podrá ver PDFs (como Guiones Generales) que el administrador haya protegido con estas etiquetas.

#### B. Archivero (Staff / Gestión)
*   **Acción:** Hacer clic en el icono `🚫` de la columna **Archivero** para pasarla a verde (`✓`).
*   **Efecto:** Le da acceso a la URL secreta de Gestión (`/miembros/gestion`) donde puede Subir, Editar y Borrar PDFs.
*   **Atención:** Ser Archivero NO le da acceso visual a todas las partituras. En su pantalla principal (Repositorio), seguirá viendo únicamente lo que dicen sus etiquetas de instrumento.

#### C. Director Musical / Administrador Principal (Master)
*   **Acción:** Hacer clic en el icono `🚫` de la columna **Master** para pasarla a verde (`✓`).
*   **Efecto:** Poder absoluto. Puede entrar a Gestión, puede editar roles de otros músicos, banear usuarios, y al entrar a su Repositorio, el sistema ignora cualquier norma de etiquetas mostrándole **el 100% de la base de datos de PDFs**.

---

## 3. Etiquetado de Partituras (El Archivero)

El panel de subida de partituras mostrará una cuadricula con todas las etiquetas maestras disponibles. Aquí tienes cómo elegir:

| Tipo de PDF a subir | Casillas a Marcar | ¿Quién lo verá? |
| :--- | :--- | :--- |
| **1. Particella de un instrumento** *(Ej: Viola)* | Solo la casilla `Viola` | Ojo: Los Jefes y Directors lo verán porque son Masters o porque se descargan el Guion, pero un chelista NO verá esta partitura. |
| **2. Particella multi-instrumento** *(Ej: Flauta/Oboe/Fagot)*| `Flauta`, `Oboe` y `Fagot` | Cualquier músico que tenga al menos uno de esos instrumentos en su perfil. |
| **3. Partitura General / Guion del Director** | `General Orquesta` | ÚNICAMENTE los Músicos que han sido ascendidos a Jefe (con la etiqueta *General Orquesta*) y los Masters (Directores). El Músico Base del grupo no la verá, lo que mantiene su tablón visualmente limpio. |
| **4. Material Comunal (Para Todos)** *(Ej: Audios de ensayo para la Orquesta entera)* | `Orquesta - Tutti` | Todo aquel que pertenezca a la Orquesta. Los músicos del Coro no lo verán. |
| **5. Sub-Ensembles Especiales** *(Ej: Partitura de Metales)* | `Ensemble Metales - Tutti` | Deberás ir primero al panel "Personal" y asignar manualmente la etiqueta `Ensemble Metales - Tutti` a los trompetistas/trompistas que formen ese grupo especial. |
| **6. Documento Administrativo** *(Ej: Normativa general, Calendario Anual)* | Marcar la pestaña: `"Marcar como Documento General"` | Es un comodín absoluto. Cualquier persona que logre hacer login en el portal (todos) lo verá. Aparece decorado en color naranja de advertencia. |

---

## 4. Ejemplos Reales (Casuísticas y Soluciones)

**Caso A: Se sube una sinfonía ("Beethoven 5 - Cuerdas") pero la sección de viento protesta porque les aparece.**
*   *Error:* Se etiquetó como `Orquesta - Tutti`.
*   *Solución:* Entrar a Gestión, Editar partitura, desmarcar `Orquesta - Tutti` y marcar individualmente `Violín primero`, `Violín segundo`, `Viola`, `Violonchelo`, `Contrabajo`.

**Caso B: El trompetista Principal asume labores de Subdirección en los parciales y necesita el Guion General.**
*   *Solución:* Entrar a la pestaña Personal -> Buscar al trompetista -> Editar sus Instrumentos -> **Sumarle** la etiqueta `General Orquesta`. (Conserva `Trompeta` y `Orquesta - Tutti`). Ahora verá tanto su papel original como el Guion cuando lo subas con esa etiqueta.

**Caso C: El archivero necesita subir el repertorio de Big Band ("Sing Sing Sing").**
*   *Acción:* Al subir la partitura de Saxofones, marca la casilla correspondiente al instrumento. Al subir el "Lead Sheet" (Guion) o el Audio, marca la casilla *`General Big Band`* (solo Jefes y Director) o *`Big Band - Tutti`* (todo el conjunto), según proceda.

**Caso D: Un usuario se da de baja de la orquesta temporalmente.**
*   *Solución:* No se le borra (para mantener el historial legal de base de datos). En gestión de "Personal", se cliquea el botón de estado para cambiarlo a `Usuario Baneado 🚫`. Auth (Clerk) cerrará su sesión de forma destructiva y no podrá loguearse.
