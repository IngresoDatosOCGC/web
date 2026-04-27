# Análisis UML: Aplicación Web OCGC

A continuación se presentan los diferentes diagramas UML solicitados, generados tras analizar la arquitectura de la aplicación Next.js, su base de datos (Prisma) y sus integraciones (Supabase).

## 1. Diagrama de Casos de Uso
Este diagrama ilustra las interacciones principales de los diferentes actores (Usuario Público, Miembro y Administrador) con el sistema.

```mermaid
flowchart TD
    %% Actors
    Public["Usuario Público"]
    Member["Miembro"]
    Admin["Administrador"]
    Archiver["Archivero"]
    SectionLeader["Jefe de Sección"]
    Seller["Vendedor"]

    subgraph PublicPortal [Portal Público]
        UC1["Consultar Conciertos"]
        UC2["Ver Información"]
        UC3["Enviar Solicitud de Ingreso"]
    end

    subgraph MemberPortal [Portal de Miembros]
        UC4["Iniciar Sesión"]
        UC5["Recuperar Contraseña"]
        UC6["Ver Perfil"]
        UC7["Descargar Partituras"]
    end

    subgraph AdminPortal [Portal Administrativo / Gestión]
        UC8["Gestionar Miembros"]
        UC9["Gestionar Solicitudes"]
        UC10["Gestionar Catálogo de Partituras"]
        UC11["Administrar Eventos"]
        UC12["Generar Códigos de Invitación"]
        UC13["Ver Logs de Actividad"]
        UC14["Gestionar Ventas / Entradas"]
        UC15["Gestionar Personal de Sección"]
    end

    %% Relations
    Public --> UC1
    Public --> UC2
    Public --> UC3

    Member --> UC4
    Member --> UC5
    Member --> UC6
    Member --> UC7

    Admin --> UC4
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14

    Archiver --> UC6
    Archiver --> UC7
    Archiver --> UC10

    SectionLeader --> UC6
    SectionLeader --> UC15

    Seller --> UC6
    Seller --> UC14
```

## 2. Diagrama de Procesos (Actividad)
Este diagrama detalla el flujo o proceso de admisión de nuevos miembros, desde que envían la solicitud hasta que completan su registro.

```mermaid
stateDiagram-v2
    [*] --> EnviarSolicitud: El usuario llena el formulario "Únete"
    
    state EnviarSolicitud {
        [*] --> GuardarJoinRequest: Se crea registro en BD (Pendiente)
    }
    
    EnviarSolicitud --> RevisionAdmin: Administrador revisa la tabla de solicitudes
    
    state RevisionAdmin {
        RevisarDatos --> Rechazar: No cumple requisitos
        RevisarDatos --> Aprobar: Cumple requisitos
    }
    
    Rechazar --> [*]: Fin del proceso
    
    Aprobar --> GenerarInvitacion: El Admin genera un código de invitación
    GenerarInvitacion --> EnviarEmail: Se envía el código por correo al usuario
    EnviarEmail --> RegistroUsuario: El usuario accede al enlace de registro
    
    state RegistroUsuario {
        ValidarCodigo --> CrearAuth: Crear cuenta en Supabase Auth
        CrearAuth --> CrearPerfil: Crear perfil de Usuario en Prisma
        CrearPerfil --> MarcarUsado: Marcar código de invitación como usado
    }
    
    RegistroUsuario --> [*]: Usuario convertido en Miembro activo
```

## 3. Diagrama de Secuencia
Este diagrama muestra la secuencia de operaciones cuando un miembro autenticado solicita ver y descargar una partitura.

```mermaid
sequenceDiagram
    actor User as Miembro
    participant Client as Next.js Client (Navegador)
    participant Middleware as Next.js Middleware (Auth)
    participant Server as Next.js Server Components / API
    participant Supabase as Supabase Auth
    participant DB as Base de Datos (PostgreSQL)

    User->>Client: Navega a la sección "Partituras"
    Client->>Middleware: GET /partituras
    Middleware->>Supabase: Validar Sesión (Cookies JWT)
    Supabase-->>Middleware: Sesión Válida / UserAuth
    Middleware-->>Client: Permite acceso a la ruta protegida
    
    Client->>Server: Solicita listado de partituras (Server Component)
    Server->>DB: Prisma: findMany(Score) filtrado por Seccion/Agrupacion del usuario
    DB-->>Server: Retorna lista de Scores
    Server-->>Client: Renderiza página con partituras
    
    User->>Client: Clic en "Descargar Partitura"
    Client->>Server: GET /api/scores/download?id=123
    Server->>DB: Prisma: Verificar permisos sobre el Score
    DB-->>Server: Permisos OK (URL del archivo Vercel Blob / S3)
    Server-->>Client: Retorna URL de descarga
    Client-->>User: Descarga iniciada
```

## 4. Diagrama de Clases (Modelo de Datos)
Basado en el esquema de Prisma (`schema.prisma`), este diagrama representa las principales entidades y sus relaciones estructurales en la base de datos relacional.

```mermaid
classDiagram
    class User {
        +Int id
        +String supabaseUserId
        +String name
        +String surname
        +String dni
        +String email
        +Boolean isActive
        +Boolean isMaster
    }

    class Estructura {
        +Int id
        +Int userId
        +Int papelId
        +Int agrupacionId
        +Int seccionId
        +Boolean activo
        +Int atril
    }

    class Residencia {
        +Int id
        +String isla
        +String municipio
    }

    class Empleo {
        +Int id
        +String trabajo
        +String estudios
    }

    class Score {
        +Int id
        +String title
        +String fileUrl
        +String[] allowedAgrupaciones
        +String[] allowedRoles
    }

    class Category {
        +Int id
        +String name
        +DateTime eventDate
    }

    class Event {
        +Int id
        +String title
        +DateTime date
        +EventType type
    }

    class JoinRequest {
        +Int id
        +String name
        +String email
        +String status
    }

    class ActivityLog {
        +Int id
        +String action
        +Json details
    }

    User "1" -- "0..1" Residencia
    User "1" -- "0..1" Empleo
    User "1" -- "*" Estructura : Participa en
    Estructura "*" -- "1" Papel
    Estructura "*" -- "1" Agrupacion
    Estructura "*" -- "1" Seccion
    Score "*" -- "0..1" Category : Agrupado en
    Event "*" -- "0..1" Category : Vinculado a
```

## 5. Diagrama de Componentes
Muestra la arquitectura de alto nivel de la aplicación Web, estructurada bajo el paradigma de Next.js (App Router), la capa de autenticación y la gestión de datos.

```mermaid
flowchart TD
    subgraph Frontend [Frontend: Next.js Client Side]
        UI[React UI Components]
        Tailwind[Tailwind CSS / Estilos]
        Forms[React Hook Form / Estado Local]
    end

    subgraph Backend [Backend: Next.js Server Side]
        SC[Server Components]
        API[API Routes / Server Actions]
        MW[Middleware de Rutas Protegidas]
    end

    subgraph External [Servicios Externos]
        SupaAuth[Supabase Auth SSR]
        Prisma[Prisma Client ORM]
        DB[(PostgreSQL Database)]
        Storage[Vercel Blob / S3 Storage]
    end

    UI <-->|Interacciones y Fetch| API
    UI <-->|Renderizado| SC
    
    SC -->|Consultas DDBB| Prisma
    API -->|Validación| SupaAuth
    API -->|CRUD Operaciones| Prisma
    API -->|Upload / Download| Storage
    MW -->|Validar Cookies JWT| SupaAuth
    Prisma <--> DB
```
