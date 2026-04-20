# 👥 Guía Completa: Importación Masiva de Miembros por CSV

Esta guía explica cómo preparar y ejecutar la importación masiva de músicos y personal de la OCGC desde una hoja de cálculo CSV. El sistema es tolerante a errores y permite importar el mismo fichero varias veces sin duplicar datos.

---

## 🗂️ Acceso al Importador

Para acceder al importador, navega a:
`/miembros/gestion` → Pestaña **Personal** → Botón **📤 CSV**

---

## 📋 Columnas del Fichero CSV

Los encabezados del archivo son **tolerantes a tildes y mayúsculas** (el sistema las normaliza internamente). Las columnas mínimas obligatorias son `nombre`, `apellidos` y `dni`.

### ✅ Campos Obligatorios

| Encabezado CSV | Alternativas aceptadas | Descripción |
| :--- | :--- | :--- |
| `nombre` | `name` | Nombre de pila del músico. |
| `apellidos` | `surname` | Apellidos completos. |
| `dni` | — | DNI o NIE. **Actúa como identificador único.** Si el DNI ya existe en la BD, la fila actualiza los datos sin duplicar. |

### 📌 Campos para Perfil de Plataforma (Recomendados)

| Encabezado CSV | Alternativas aceptadas | Descripción |
| :--- | :--- | :--- |
| `email` | `correo` | Correo electrónico. Si se omite, el usuario se crea como **Externo** (sin acceso a la plataforma). |
| `telefono` | `phone` | Teléfono de contacto. |
| `fecha_nacimiento` | `birth_date` | Fecha de nacimiento en formato `YYYY-MM-DD` (ej: `1990-05-20`). |

> [!NOTE]
> **Contraseña inicial**: Cuando se crea un usuario con email, su contraseña inicial es su DNI en mayúsculas (ej: `12345678A`). El usuario deberá cambiarla desde `/forgot-password` tras el primer inicio de sesión.

### 🎵 Campos de Perfil Artístico

Estos campos asignan al músico en la estructura artística de la OCGC. Para que funcionen correctamente, los valores deben existir exactamente en la base de datos (panel **Estructuras y Catálogos**).

| Encabezado CSV | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `agrupacion` | Nombre de la agrupación. | `Orquesta`, `Coro`, `Ensemble Chelos` |
| `seccion` | Sección o instrumento. | `Violín primero`, `Soprano`, `Oboe` |
| `papel` | Papel musical. | `Músico`, `Director`, `Solista` |
| `atril` | Número de atril (entero). | `3` |
| `activo` | Si el perfil artístico está activo. | `true` / `false` (por defecto: `true`) |

#### Aliases de Agrupación Aceptados
El sistema acepta automáticamente los siguientes nombres históricos y los mapea a su versión canónica en la base de datos:

| Nombre en CSV | Se convierte en |
| :--- | :--- |
| `Orquesta Comunitaria Gran Canaria` | `Orquesta` |
| `Orquesta OCGC` | `Orquesta` |
| `Coro OCGC` | `Coro` |
| `Coro Donna Voce` | `Coro` |
| `Ensemble Violonchelos` | `Ensemble Chelos` |
| `Ensemble Violonchelo` | `Ensemble Chelos` |

### 🛡️ Campos de Permisos y Roles

| Encabezado CSV | Alternativas aceptadas | Descripción |
| :--- | :--- | :--- |
| `es_master` | `ismaster` | `true` si el usuario debe tener permisos de Administrador Master. |
| `es_archivero` | `isarchiver` | `true` si el usuario debe tener acceso al Archivo de Partituras. |
| `es_vendedor` | `es_seller`, `isseller` | `true` si el usuario debe tener permisos de Vendedor. |
| `es_external` | `isexternal` | `true` para usuarios sin cuenta en la plataforma. Si no hay email, se asigna `true` automáticamente. |

> [!IMPORTANT]
> Todos los campos de permisos son opcionales y su valor por defecto es `false`. Solo indícalos explícitamente si el usuario debe tener ese rol desde el momento de la importación.

### 🏠 Campos de Residencia (Opcionales)

| Encabezado CSV | Descripción |
| :--- | :--- |
| `isla` | Isla de residencia. Ej: `Gran Canaria`, `Tenerife`. |
| `municipio` | Municipio de residencia. |
| `empadronamiento` | Estado de empadronamiento. |

### 🚗 Campos Adicionales (Opcionales)

| Encabezado CSV | Alternativas aceptadas | Descripción |
| :--- | :--- | :--- |
| `matricula` | `matricula_number`, `matricula_coche` | Matrícula del vehículo para gestión de aparcamiento. |
| `trabajo` | — | Situación laboral. |
| `estudios` | — | Nivel de estudios. |

---

## 📄 Ejemplo de Archivo CSV Completo

```csv
nombre,apellidos,dni,email,telefono,fecha_nacimiento,agrupacion,seccion,papel,atril,activo,es_master,isla,municipio
Juan,Pérez García,12345678A,juan@gmail.com,+34 600 000 001,1985-03-15,Orquesta,Violín primero,Músico,3,true,false,Gran Canaria,Las Palmas de GC
María,López Sánchez,87654321B,,+34 611 222 333,1990-07-22,Coro,Soprano,Músico,,true,false,,
Carlos,Ruiz Martín,11223344C,carlos@correo.com,+34 622 333 444,1978-11-01,Orquesta,Oboe,Músico,1,true,false,Tenerife,Santa Cruz
Ana,González Díaz,44332211D,ana@gmail.com,+34 633 444 555,1995-02-28,Coro,Alto,Músico,2,true,false,Gran Canaria,Telde
Pedro,Torres Vega,55443322E,,,,,,,,,true,,
```

### Notas del ejemplo:
- **María** no tiene email → se crea como usuario **Externo** automáticamente.
- **Pedro** solo tiene nombre, apellidos y DNI → se crea en la BD local sin perfil artístico ni acceso a la plataforma.
- Se pueden añadir múltiples filas para el **mismo músico** con distintas agrupaciones/secciones (la unicidad es por DNI + agrupación + sección + papel).

---

## 🔄 Lógica de Importación (Comportamiento Detallado)

```
Para cada fila del CSV:
│
├─ ¿Existe ya un usuario con ese DNI en la BD?
│   ├─ SÍ y ¿tiene ya la misma agrupación+sección+papel?
│   │   └─ ⏭️  OMITIDA (se cuenta como "Omitido")
│   │
│   ├─ SÍ pero con perfil artístico distinto
│   │   └─ ✅  Se AÑADE la nueva estructura artística al usuario existente
│   │
│   └─ NO (usuario nuevo)
│       ├─ ¿Tiene email?
│       │   ├─ SÍ → Se crea en Supabase Auth. Contraseña inicial: DNI en mayúsculas.
│       │   └─ NO → Se crea solo en BD local como usuario Externo.
│       │
│       └─ ✅ Se crea en la Base de Datos local con todos los datos proporcionados.
```

---

## ⚠️ Errores Frecuentes y Soluciones

| Error | Causa probable | Solución |
| :--- | :--- | :--- |
| `Nombre, Apellidos y DNI son obligatorios` | Alguno de estos tres campos está vacío en esa fila. | Revisar la fila e incluir los tres campos. |
| `Perfil artístico no vinculado` | La agrupación, sección o papel indicado no existe en la BD. | Verificar que los valores existen exactamente en el panel *Estructuras y Catálogos*. |
| `Error en [Nombre]: email_exists` | El email ya está registrado en Supabase con otro perfil. | Comprobar si ya existe ese usuario e intentar importarlo sin email (como Externo) para solo añadir su estructura. |
| `Fallo de conexión` | El servidor no respondió a la petición de esa fila. | Reintentar la importación. Las filas ya importadas serán omitidas automáticamente. |

---

## 🔐 Acceso Posterior de los Usuarios Importados

Los usuarios creados con email pueden iniciar sesión en la plataforma de dos formas:

1. **Con su dirección de correo electrónico.**
2. **Con su nombre de usuario** (`username`), que equivale a su DNI en mayúsculas (ej: `12345678A`) si no se especificó uno distinto en la columna `username`.

La contraseña inicial en ambos casos es el **DNI en mayúsculas**. Se recomienda que los músicos la cambien tras el primer inicio de sesión.

---

> [!TIP]
> Para actualizar datos de usuarios ya existentes (ej: nuevo teléfono, nueva sección), puedes volver a importar el mismo CSV. El sistema detectará el DNI y actualizará los datos sin crear duplicados.

---
**Documento generado para el Portal de Miembros OCGC – Abril 2026.**
