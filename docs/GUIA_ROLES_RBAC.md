# 🛡️ Guía de Expansión del Sistema de Roles (RBAC) - OCGC

Esta guía detalla cómo añadir nuevos roles y permisos a la plataforma, manteniendo la arquitectura de **Base de Datos como Fuente de Verdad** y **Supabase Metadatos como Caché**.

---

## Opción A: Roles Rápidos (Sistema Basado en Flags)
Ideal para roles únicos y permanentes (ej. Tesorero, Director Artístico, Secretaría).

### 1. Actualizar el Esquema de Base de Datos
Añade una columna booleana al modelo `User` en `prisma/schema.prisma`:
```prisma
model User {
  // ...
  isMaster    Boolean @default(false)
  isTreasurer Boolean @default(false) // <-- Nuevo rol
}
```
Luego ejecuta: `npx prisma db push`

### 2. Sincronizar con la Caché (Supabase)
Modifica `lib/supabase-sync.ts` para que incluya el nuevo permiso en el JWT del usuario:
```typescript
// En la función syncUserMetadata:
if (user.isTreasurer) {
  permissions.push('treasury:manage', 'treasury:view');
}
```

### 3. Exponer en el Frontend
Actualiza `/api/auth/me/route.ts` para que devuelva el nuevo flag:
```typescript
return NextResponse.json({
  // ...
  isTreasurer: !!dbUser.isTreasurer,
  permissions: permissions // La caché se actualizará sola
});
```

---

## Opción B: Roles Escalables (Sistema Dinámico)
Ideal si el número de roles va a ser muy grande o variable.

### 1. Definir Modelos de Relación
En `prisma/schema.prisma`, crea una tabla de Roles:
```prisma
model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique
  users User[]
}
```

### 2. Lógica de Sincronización
En `lib/supabase-sync.ts`, mapea los nombres de los roles directamente a la caché:
```typescript
const roles = user.roles.map(r => r.name);
// app_metadata: { roles: roles }
```

---

## 🛡️ Cómo Aplicar Permisos en el Código

### En el Servidor (APIs)
Utiliza siempre `getSessionUser()` para verificar el rol contra la DB real:
```typescript
const user = await getSessionUser();
if (!user?.isMaster && !user?.isTreasurer) {
  return new NextResponse("Acceso Denegado", { status: 403 });
}
```

### En el Cliente (Componentes)
Utiliza el hook `useSupabaseAuth` para ocultar o mostrar elementos visuales rápidamente:
```tsx
const { hasPermission } = useSupabaseAuth();

{hasPermission('treasury:manage') && (
  <button>Generar Informe Contable</button>
)}
```

---

## 🔄 Nota sobre la Propagación
Recuerda que los cambios de roles realizados en la base de datos se propagan al usuario en su **próximo inicio de sesión** (vía JWT) o **instantáneamente** si llamas a la función `syncUserMetadata(dbId)` tras realizar el cambio en el panel de administración.
