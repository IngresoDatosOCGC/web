# 🛡️ Guía de Expansión del Sistema de Roles (RBAC) - OCGC

Esta guía detalla cómo añadir nuevos roles y permisos a la plataforma, manteniendo la arquitectura de **Base de Datos como Fuente de Verdad** y **Supabase Metadatos como Caché**.

---

## 🛠️ Paso a Paso: Creación de un Nuevo Rol (Ejemplo: Vendedor)

### 1. Base de Datos (Prisma)
Añade el flag booleano al modelo `User` en `prisma/schema.prisma`:
```prisma
model User {
  // ...
  isSeller     Boolean @default(false) // Nuevo rol
}
```
Ejecuta: `npx prisma db push` y luego `npx prisma generate` para actualizar el cliente.

### 2. Lógica de Sincronización (Caché Auth)
Modifica `lib/supabase-sync.ts` para que el nuevo rol se incluya en el JWT que viaja entre servidores:
```typescript
// Define permisos granulares para el motor de políticas
if (user.isSeller || user.isMaster) {
  permissions.push('service_b:access'); 
}

// Sincroniza el flag en app_metadata (Metadatos de Auth)
const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseUserId, {
  app_metadata: {
    isSeller: !!user.isSeller,
    // ...
  }
});
```

### 3. API de Administración
Actualiza los endpoints de gestión para que soporten el nuevo flag:
*   `app/api/admin/users/route.ts`: Añadir el mapeo en `GET` y la acción `toggle-seller` en `POST`.
*   `app/api/admin/users/create/route.ts`: Incluir `isSeller` en la lógica de creación manual (`upsert`).

### 4. Interfaz de Usuario (UI Admin)
En `components/admin/PersonalPanel.tsx`, integra el rol en la experiencia del administrador:
*   **Estado**: Añadir `isSeller` al objeto `manualUser`.
*   **Acción**: Crear la función `toggleSellerStatus` que llame a la API.
*   **Visualización**: Añadir la columna en la tabla (`Ven`) y el checkbox en el modal de creación.
*   **Filtros**: Actualizar el `useMemo` de filtrado y el desplegable de roles.

---

## 🌐 Seguridad en Microservicios (Servidores Externos)
Para que un servidor externo (Server B) sea seguro, debe seguir este flujo:

1.  **Recepción**: El servidor B recibe el `access_token` de Supabase (vía URL o Header Authorization).
2.  **Validación**: Llama a `supabase.auth.getUser(token)`. Si la firma es válida, Supabase devuelve el objeto `user`.
3.  **Autorización**: Verifica los metadatos inyectados en el paso 2:
```javascript
const userRole = user.user_metadata?.isSeller; // o app_metadata
if (!userRole && !user.user_metadata?.isMaster) {
    return res.status(403).send("No tienes permiso para este microservicio.");
}
```

---

## 🛡️ Cómo Aplicar Permisos en el Código Principal

### En el Servidor (APIs)
Utiliza siempre `getSessionUser()` para verificar el rol contra la DB real:
```typescript
const user = await getSessionUser();
if (!user?.isMaster && !user?.isSeller) {
  return new NextResponse("Acceso Denegado", { status: 403 });
}
```

### En el Cliente (Componentes)
Utiliza el hook `useSupabaseAuth` (o lee el token) para la interfaz reactiva:
```tsx
const { user } = useSupabaseAuth();
const canAccess = user?.app_metadata?.isSeller || user?.app_metadata?.isMaster;

{canAccess && <Link href="...">Panel de Ventas</Link>}
```

---

## 🔄 Nota sobre la Propagación
Recuerda que los cambios de roles realizados en la base de datos se propagan al usuario **instantáneamente** gracias a la función `syncUserMetadata(dbId)`. Esta función invalida la caché anterior y fuerza a Supabase a emitir metadatos actualizados en la próxima validación de token.
