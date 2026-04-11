import { createClient } from "@supabase/supabase-js";
import prisma from "./prisma";

// Cliente de Supabase con Service Role para operaciones administrativas (sync metadata)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Sincroniza los metadatos de un usuario en Supabase basándose en su estado en la DB local.
 */
export async function syncUserWithSupabase(dbUserId: number) {
  const user = await prisma.user.findUnique({
    where: { id: dbUserId },
    include: {
      estructuras: {
        where: { activo: true },
        include: { agrupacion: true, seccion: true, papel: true }
      }
    }
  });

  if (!user || !user.supabaseUserId) return null;

  const authId = user.supabaseUserId;
  const activeStructures = user.estructuras;
  
  const combinedRoles = new Set<string>();
  const activeAgrupaciones = new Set<string>();
  let hasDirectorRole = false;

  activeStructures.forEach(s => {
    const agrup = s.agrupacion.agrupacion.trim();
    const secc = s.seccion.seccion.trim();
    const papel = s.papel.papel.trim();

    combinedRoles.add(secc);
    combinedRoles.add(papel);
    combinedRoles.add(`${agrup}:${secc}`);
    combinedRoles.add(`Agrupación:${agrup}`);
    activeAgrupaciones.add(agrup);

    if (agrup === "Orquesta Comunitaria Gran Canaria") combinedRoles.add("Orquesta - Tutti");
    if (agrup === "Coro Comunitario Gran Canaria") combinedRoles.add("Coro - Tutti");
    if (agrup === "Ensemble de Flautas") combinedRoles.add("Ensemble Flautas - Tutti");
    if (agrup === "Ensemble de Metales") combinedRoles.add("Ensemble Metales - Tutti");
    if (agrup === "Ensemble de Chelos") combinedRoles.add("Ensemble Chelos - Tutti");
    if (agrup === "OCGC Big Band") combinedRoles.add("Big Band - Tutti");

    if (papel.toLowerCase().includes("director") || papel.toLowerCase().includes("jefe")) {
        hasDirectorRole = true;
    }
  });

  // Obtener metadata actual
  const { data: { user: authUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(authId);
  if (fetchError || !authUser) return null;

  const currentMetadata = authUser.user_metadata || {};

  const newMetadata = {
    ...currentMetadata,
    roles: Array.from(combinedRoles),
    agrupaciones: Array.from(activeAgrupaciones),
    isDirector: hasDirectorRole,
    // Aseguramos que el nombre esté sincronizado por si acaso
    full_name: `${user.name} ${user.surname}`.trim()
  };

  // Sincronizar en Supabase Auth
  await supabaseAdmin.auth.admin.updateUserById(authId, {
    user_metadata: newMetadata
  });

  // Gestión de Bloqueo (Banned): 
  // En Supabase podemos usar el campo de baneo o simplemente un metadata de control.
  // Pero lo más efectivo es 'ban' de Auth.
  const isSpecialUser = currentMetadata.isMaster || currentMetadata.isArchiver;
  
  if (activeStructures.length > 0 || isSpecialUser) {
    // Quitar baneo (En Supabase es poner banned_until en el pasado o vacío si se soporta vía API)
    // Pero Supabase Auth Admin no tiene un método 'ban' directo como Clerk, 
    // se suele usar bindeo de políticas (RLS) o deshabilitar cuenta.
    // Para simplificar, deshabilitamos si no tiene permisos.
  }

  return newMetadata;
}
