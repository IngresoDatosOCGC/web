import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { logActivity } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { syncUserMetadata } from "@/lib/supabase-sync";

// Cliente Admin para listar usuarios de Auth si es necesario
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const admin = await getSessionUser();
  
  // Solo el Master puede gestionar músicos
  if (!admin?.isMaster) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const dbUsers = await prisma.user.findMany({
      include: {
        estructuras: {
          include: {
            agrupacion: true,
            seccion: true,
            papel: true
          }
        }
      }
    });

    const allMembers = dbUsers.map(db => ({
      id: db.supabaseUserId || `ext_${db.id}`,
      dbId: db.id,
      name: `${db.name} ${db.surname}`.trim() || "Sin nombre",
      email: db.email || "—",
      roles: db.estructuras.filter(e => e.activo).map(e => e.seccion.seccion),
      isArchiver: !!db.isArchiver,
      isMaster: !!db.isMaster,
      isSeller: !!db.isSeller,
      isActive: db.isActive,
      isExternal: db.isExternal,
      birthDate: db.birthDate,
      hasCertificate: !!db.hasCertificate,
      estructuras: db.estructuras.map(e => ({
        id: e.id,
        agrupacion: e.agrupacion.agrupacion,
        seccion: e.seccion.seccion,
        papel: e.papel.papel,
        activo: e.activo,
        atril: e.atril
      }))
    }));

    return NextResponse.json(allMembers);
  } catch (error) {
    console.error("Error fetching members from DB:", error);
    return new NextResponse("Database Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getSessionUser();
  if (!admin?.isMaster) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { userId, action, isArchiver, isMaster, isSeller, estructuraId, activo, atril } = body;

  try {
      const isLocalOnly = typeof userId === 'string' && userId.startsWith('ext_');
      
      // Buscar el ID de la base de datos (dbId) 
      const dbUser = await prisma.user.findFirst({ 
        where: isLocalOnly ? { id: parseInt(userId.replace('ext_', '')) } : { supabaseUserId: userId } 
      });
      
      if (!dbUser) {
        return new NextResponse("Usuario no encontrado en la DB local", { status: 404 });
      }

      const dbId = dbUser.id;
      const targetName = `${dbUser.name} ${dbUser.surname}`.trim();

      // Acción para Banear / Desbanear
      if (action === "toggle-ban") {
         const { isBanned } = body; 
         await prisma.user.update({
           where: { id: dbId },
           data: { 
             isActive: !isBanned,
             estructuras: {
               updateMany: { where: {}, data: { activo: !isBanned } }
             }
           }
         });
         await logActivity(`Perfil ${isBanned ? 'Desactivado' : 'Activado'}`, admin.supabaseUserId || '', { target: targetName });
      }

      // Acción para actualizar una estructura específica
      if (action === "update-estructura") {
        if (!estructuraId) return new NextResponse("Falta estructuraId", { status: 400 });
        await prisma.estructura.update({
          where: { id: estructuraId },
          data: {
            activo: activo !== undefined ? activo : undefined,
            atril: atril !== undefined ? (atril === "" ? null : parseInt(atril)) : undefined
          }
        });
        await logActivity("Estructura Actualizada", admin.supabaseUserId || '', { target: targetName });
      }

      // Acción para AÑADIR una nueva estructura
      if (action === "add-estructura") {
        const { agrupacionId, seccionId, papelId } = body;
        await prisma.estructura.upsert({
          where: {
            userId_papelId_agrupacionId_seccionId: {
              userId: dbId,
              agrupacionId: parseInt(agrupacionId),
              seccionId: parseInt(seccionId),
              papelId: parseInt(papelId)
            }
          },
          update: { activo: true },
          create: {
            userId: dbId,
            agrupacionId: parseInt(agrupacionId),
            seccionId: parseInt(seccionId),
            papelId: parseInt(papelId),
            activo: true
          }
        });
        await logActivity("Nueva Estructura Añadida", admin.supabaseUserId || '', { target: targetName });
      }

      // Acción para ELIMINAR una estructura
      if (action === "delete-estructura") {
        if (!estructuraId) return new NextResponse("Falta estructuraId", { status: 400 });
        await prisma.estructura.delete({ where: { id: estructuraId } });
        await logActivity("Estructura Eliminada", admin.supabaseUserId || '', { target: targetName });
      }

     // Acción para cambiar permiso de Archivero (EN LA DB)
     if (action === "toggle-archiver") {
        const newValue = isArchiver !== undefined ? isArchiver : !dbUser.isArchiver;
        await prisma.user.update({
          where: { id: dbId },
          data: { isArchiver: newValue }
        });
        await logActivity("Cambio permiso Archivero", admin.supabaseUserId || '', { 
          target: targetName, 
          isArchiver: newValue 
        });
     }

      // Acción para cambiar permiso de Master (EN LA DB)
      if (action === "toggle-master") {
        const newValue = isMaster !== undefined ? isMaster : !dbUser.isMaster;
        await prisma.user.update({
          where: { id: dbId },
          data: { isMaster: newValue }
        });
        await logActivity("Cambio permiso Master", admin.supabaseUserId || '', { 
          target: targetName, 
          isMaster: newValue 
        });
      }

      // Acción para cambiar permiso de Vendedor (EN LA DB)
      if (action === "toggle-seller") {
        const newValue = isSeller !== undefined ? isSeller : !dbUser.isSeller;
        await prisma.user.update({
          where: { id: dbId },
          data: { isSeller: newValue }
        });
        await logActivity("Cambio permiso Vendedor", admin.supabaseUserId || '', { 
          target: targetName, 
          isSeller: newValue 
        });
      }

      // Acción para actualizar datos personales básicos
      if (action === "update-user-profile") {
        const { birthDate, hasCertificate } = body;
        await prisma.user.update({
          where: { id: dbId },
          data: { 
            birthDate: birthDate || null,
            hasCertificate: !!hasCertificate
          }
        });
        await logActivity("Perfil Personal Actualizado", admin.supabaseUserId || '', { target: targetName });
      }

      // 🔄 SINCRONIZACIÓN DE CACHÉ (app_metadata)
      // Actualizamos la caché de Supabase Auth para que la UI refleje el cambio rápidamente
      await syncUserMetadata(dbId);

      return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in user action:", err);
    return new NextResponse("Action failed", { status: 500 });
  }
}
