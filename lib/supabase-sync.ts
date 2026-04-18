import { createClient } from "@supabase/supabase-js";
import prisma from "./prisma";

// Cliente Admin para actualizar app_metadata (Caché de roles)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Sincroniza los roles y permisos de la Base de Datos (Prisma) 
 * hacia la Caché de Supabase Auth (app_metadata).
 * 
 * 👉 La DB es la Verdad Absoluta.
 * 👉 app_metadata es solo caché para rendimiento UI.
 */
export async function syncUserMetadata(dbId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: dbId },
      include: {
        estructuras: {
          where: { activo: true },
          include: { seccion: true }
        }
      }
    });

    if (!user || !user.supabaseUserId) return;

    // Calcular permisos granulares para la caché
    const permissions: string[] = [];
    if (user.isMaster) {
      permissions.push('admin:all', 'users:manage', 'scores:manage', 'events:manage');
    }
    if (user.isArchiver || user.isMaster) {
      permissions.push('scores:edit', 'scores:upload', 'scores:view_all');
    }
    if (user.isSeller || user.isMaster) {
      permissions.push('service_b:access');
    }

    const roles = Array.from(new Set(user.estructuras.map(e => e.seccion.seccion)));

    // Actualizar app_metadata en Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseUserId, {
      app_metadata: {
        isMaster: !!user.isMaster,
        isArchiver: !!user.isArchiver,
        isSeller: !!user.isSeller,
        isSectionLeader: !!user.isSectionLeader,
        roles: roles,
        permissions: permissions
      }
    });

    if (error) {
      console.error(`❌ Error actualizando caché para ${user.email}:`, error.message);
    } else {
      console.log(`✅ Caché (app_metadata) sincronizada para: ${user.email}`);
    }
  } catch (err) {
    console.error("❌ Fallo crítico en sincronización de metadatos:", err);
  }
}
