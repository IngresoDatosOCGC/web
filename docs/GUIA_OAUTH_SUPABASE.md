# Arquitectura Avanzada: OAuth 2.1 con Supabase

Esta guía cubre la implementación técnica para usar Supabase no solo como método de entrada, sino como el orquestador de un ecosistema OAuth 2.1.

---

## Escenario A: Tu App como Proveedor OAuth (Servidor)
*Usa esto si quieres que otros servicios (como tu servidor Python/Flask) se autentiquen contra OCGC.*

Supabase Auth ahora permite actuar como un servidor OAuth 2.1 estándar (OIDC).

### 1. Registro de Aplicaciones (Clients)
En el Dashboard de Supabase, debes registrar las aplicaciones que consumirán tu identidad:
1. Ve a **Authentication** > **OAuth Server** (si está disponible en tu plan) o utiliza la CLI.
2. Registra un `client_id` y `client_secret` para tu servidor externo.
3. Define las **Redirect URIs** permitidas para esos clientes.

### 2. El Flujo de Autorización (PKCE)
Tu aplicación Next.js debe implementar una pantalla de **Consentimiento** (`/oauth/consent`).
*   **Paso 1**: El servicio externo redirige a Supabase: `https://<ref>.supabase.co/auth/v1/oauth/authorize`.
*   **Paso 2**: Supabase valida la sesión y redirige a tu pantalla de consentimiento en Next.js.
*   **Paso 3**: Tu app usa `supabase.auth.oauth.approveAuthorization(id)` para emitir el código de acceso.

---

## Escenario B: Acceso a APIs Externas (Integraciones)
*Usa esto si OCGC necesita escribir en el Google Calendar o Drive del músico.*

Cuando un usuario hace login con Google vía Supabase, Supabase recibe un `provider_token`.

### 1. Solicitar Scopes (Permisos)
Al iniciar el login, debes pedir explícitamente los permisos necesarios:
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly',
    queryParams: {
      access_type: 'offline', // Importante para obtener refresh_token de Google
      prompt: 'consent',
    }
  }
})
```

### 2. Recuperar el Token en el Servidor
Para llamar a la API de Google desde tu backend:
```typescript
const { data: { session } } = await supabase.auth.getSession();
const googleToken = session?.provider_token; 
// Usa este token en el Header: Authorization: Bearer ${googleToken}
```

---

## 3. Cambios Estructurales Sugeridos en OCGC

### A. Refactor del Middleware de Sesión
El `middleware.ts` actual solo verifica si el usuario existe. Para un sistema OAuth completo, debería verificar el `client_id` si la petición viene de un tercero, permitiendo un control de acceso basado en aplicaciones.

### B. Gestión de "Grants" (Autorizaciones)
Es recomendable crear una sección en el perfil del usuario donde pueda ver y revocar las aplicaciones a las que ha dado permiso (vía `supabase.auth.oauth.getUserGrants()`).

### C. Sincronización con Servidores Externos (Flask)
En lugar de validar solo el JWT de Supabase manualmente, tu servidor Flask puede usar el endpoint `userinfo` de Supabase:
```bash
GET https://<ref>.supabase.co/auth/v1/oauth/userinfo
Authorization: Bearer <access_token>
```

---

> [!TIP]
> Si tu objetivo es que el **Archivero** pueda subir partituras directamente a un Google Drive corporativo o personal, el **Escenario B** es el camino a seguir. Si buscas que el servidor de Python sea un nodo independiente pero "confíe" en OCGC, el **Escenario A** es el correcto.
