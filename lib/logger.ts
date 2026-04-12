import prisma from "./prisma";

/**
 * Registra una acción administrativa en el log de actividad.
 * @param action - Descripción breve de la acción
 * @param authId - ID de Supabase Auth del administrador que realiza la acción
 * @param details - Objeto con detalles adicionales
 */
export async function logActivity(action: string, authId: string | null, details: any = {}) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        userAuthId: authId,
        details: details || {},
      },
    });
  } catch (error) {
    console.error("Error al registrar actividad en el log:", error);
  }
}
