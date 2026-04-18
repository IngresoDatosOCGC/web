# Guía Definitiva de Etiquetas y Permisos (Archivo OCGC)

Este documento detalla el funcionamiento del sistema de "cruce de etiquetas" mediante el cual se otorgan y gestionan los permisos de acceso a las partituras y documentos en el Repositorio de la Orquesta Comunitaria de Gran Canaria.

## 1. El Concepto Base: Cruce de Etiquetas

El sistema **no** usa una relación estricta en base de datos para la visibilidad. En su lugar, utiliza un sistema de metadatos gestionados a través de **Supabase Auth**.
El repositorio de cada usuario funciona inspeccionando qué etiquetas (Roles/Tags) tiene en su Perfil y qué etiquetas se le asignaron al PDF cuando el administrador lo subió.

**Regla de Oro:** Un usuario SOLO verá en su repositorio las partituras/documentos que tengan **al menos una etiqueta coincidente** con las que él tiene en su perfil. (Excepción explícita: El rol "Master" y los archivos marcados como "Documento General").

---

## 2. Etiquetado de Usuarios (El Músico)

### 2.1 Asignación Automática (Registro)
Cuando un usuario completa el formulario de alta, el sistema le asigna etiquetas base:
1.  **Su Instrumento/Familia:** (Ej. `Violonchelo`, `Soprano (coro)`).
2.  **Su Agrupación Global:** (Ej. `Orquesta - Tutti`, `Coro - Tutti`).

Estas etiquetas se guardan en la base de datos y se sincronizan con los metadatos de Supabase (`app_metadata`) para un acceso rápido.

### 2.2 Asignación Manual (Panel "Personal")
Cualquier permiso adicional más allá de ser un Músico Base debe gestionarse manualmente por un Administrador desde `/miembros/gestion` -> Pestaña **Personal**.

#### A. Jefe de Sección / Subdirector
No es un flag booleano, sino que funciona por etiquetas especiales de "Guion".
*   **Acción:** Editar los instrumentos del músico y sumarle la etiqueta `General Orquesta`, `General Coro`, etc.
*   **Efecto:** El músico podrá ver partituras marcadas con esas etiquetas (ej. Guiones).

#### B. Archivero (Staff / Gestión)
*   **Acción:** Activar el switch de **Archivero** en la tabla de usuarios.
*   **Efecto:** Acceso a `/miembros/gestion` para subir y editar documentos.

#### C. Director Musical / Administrador Principal (Master)
*   **Acción:** Activar el switch de **Master**.
*   **Efecto:** Poder absoluto. Salta todas las reglas de etiquetas y ve el 100% de la base de datos en su Repositorio.

---

## 3. Etiquetado de Partituras (El Archivero)

Al subir un PDF, se marcan las casillas de etiquetas correspondientes:

| Tipo de PDF | Etiquetas a Marcar | ¿Quién lo verá? |
| :--- | :--- | :--- |
| **Particella individual** | Solo el instrumento (ej: `Viola`) | Músicos con ese instrumento. |
| **Guion del Director** | `General Orquesta` | Jefes de sección y Masters. |
| **Material para todos** | `Orquesta - Tutti` | Toda la agrupación. |
| **Documento Común** | Marcar como `"Documento General"` | TODO usuario registrado. |

---

## 4. Gestión de Estados

- **Usuario Activo**: Acceso normal según sus etiquetas.
- **Usuario Baneado 🚫**: Bloqueo total de acceso. Supabase invalidará su sesión de inmediato.
- **Invitaciones**: Los códigos de invitación permiten el registro único y vinculan al usuario con su ficha previa de la orquesta.

---
**Documento actualizado a Abril de 2026.**
