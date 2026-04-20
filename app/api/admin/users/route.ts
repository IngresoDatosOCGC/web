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

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const admin = await getSessionUser();
  
  // Solo el Master puede gestionar músicos
  if (!admin?.isMaster) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("id");

  try {
    if (targetUserId) {
      // CARGA BAJO DEMANDA: Datos completos para un usuario específico (Modal de Edición)
      const isLocalOnly = typeof targetUserId === 'string' && targetUserId.startsWith('ext_');
      const dbUser = await (isLocalOnly 
        ? prisma.user.findUnique({ where: { id: parseInt(targetUserId.replace('ext_', '')) }, include: { estructuras: { include: { agrupacion: true, seccion: true, papel: true } } } })
        : prisma.user.findUnique({ where: { supabaseUserId: targetUserId }, include: { estructuras: { include: { agrupacion: true, seccion: true, papel: true } } } })
      );

      if (!dbUser) return new NextResponse("User not found", { status: 404 });

      return NextResponse.json({
        id: dbUser.supabaseUserId || `ext_${dbUser.id}`,
        dbId: dbUser.id,
        firstName: dbUser.name || "",
        surname: dbUser.surname || "",
        name: `${dbUser.name || ""} ${dbUser.surname || ""}`.trim() || "Sin nombre",
        email: dbUser.email || "—",
        dni: dbUser.dni || "",
        phone: dbUser.phone || "",
        roles: dbUser.estructuras.filter(e => e.activo).map(e => e.seccion.seccion),
        isArchiver: !!dbUser.isArchiver,
        isMaster: !!dbUser.isMaster,
        isSeller: !!dbUser.isSeller,
        isSectionLeader: !!dbUser.isSectionLeader,
        isActive: dbUser.isActive,
        isExternal: dbUser.isExternal,
        birthDate: dbUser.birthDate,
        hasCertificate: !!dbUser.hasCertificate,
        estructuras: dbUser.estructuras.map(e => ({
          id: e.id,
          agrupacionId: e.agrupacion.id,
          seccionId: e.seccion.id,
          papelId: e.papel.id,
          agrupacion: e.agrupacion.agrupacion,
          seccion: e.seccion.seccion,
          papel: e.papel.papel,
          activo: e.activo,
          atril: e.atril
        }))
      });
    }

    // CARGA INICIAL: Lista resumida para la tabla general
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        supabaseUserId: true,
        name: true,
        surname: true,
        email: true,
        isActive: true,
        isMaster: true,
        isArchiver: true,
        isSectionLeader: true,
        isExternal: true,
        // Solo necesitamos saber qué roles tienen para mostrarlos en la tabla
        estructuras: {
          where: { activo: true },
          select: { seccion: { select: { seccion: true } } }
        }
      },
      orderBy: { name: 'asc' }
    });

    const summarizedMembers = dbUsers.map(db => ({
      id: db.supabaseUserId || `ext_${db.id}`,
      dbId: db.id,
      name: `${db.name || ""} ${db.surname || ""}`.trim() || "Sin nombre",
      email: db.email || "—",
      isActive: db.isActive,
      isMaster: db.isMaster,
      isArchiver: db.isArchiver,
      isSectionLeader: db.isSectionLeader,
      isExternal: db.isExternal,
      roles: db.estructuras.map(e => e.seccion.seccion)
    }));

    return NextResponse.json(summarizedMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
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

      // Acción para actualizar datos base del usuario
      if (action === "update-user") {
        const { firstName, surname, birthDate, hasCertificate, dni, phone } = body;
        await prisma.user.update({
          where: { id: dbId },
          data: {
            name: firstName !== undefined ? firstName : undefined,
            surname: surname !== undefined ? (surname || "") : undefined,
            dni: dni !== undefined ? dni : undefined,
            phone: phone !== undefined ? phone : undefined,
            birthDate: birthDate !== undefined ? (birthDate || null) : undefined,
            hasCertificate: hasCertificate !== undefined ? hasCertificate : undefined
          }
        });
        await logActivity("Perfil base actualizado", admin.supabaseUserId || '', { target: targetName });
      }

      // Acción para actualizar una estructura específica
      if (action === "update-estructura") {
        if (!estructuraId) return new NextResponse("Falta estructuraId", { status: 400 });
        
        const { agrupacionId: updateAgr, seccionId: updateSec, papelId: updatePap } = body;
        
        await prisma.estructura.update({
          where: { id: estructuraId },
          data: {
            activo: activo !== undefined ? activo : undefined,
            atril: atril !== undefined ? (atril === "" ? null : parseInt(atril)) : undefined,
            agrupacionId: updateAgr !== undefined ? parseInt(updateAgr) : undefined,
            seccionId: updateSec !== undefined ? parseInt(updateSec) : undefined,
            papelId: updatePap !== undefined ? parseInt(updatePap) : undefined
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

      // Sincronización automática del estado 'isActive' del usuario basándose en sus estructuras
      if (["update-estructura", "add-estructura", "delete-estructura"].includes(action)) {
        const remainingEstructuras = await prisma.estructura.findMany({ where: { userId: dbId } });
        const hasActive = remainingEstructuras.some(e => e.activo);
        
        // Si el estado derivado de las estructuras es distinto al que tiene actualmente, lo actualizamos
        if (dbUser.isActive !== hasActive) {
          await prisma.user.update({
            where: { id: dbId },
            data: { isActive: hasActive }
          });
        }
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

      // Acción para cambiar permiso Jefe de Sección (EN LA DB)
      if (action === "toggle-section-leader") {
        const { isSectionLeader } = body;
        const newValue = isSectionLeader !== undefined ? isSectionLeader : !dbUser.isSectionLeader;
        await prisma.user.update({
          where: { id: dbId },
          data: { isSectionLeader: newValue }
        });
        await logActivity("Cambio permiso Jefe Sección", admin.supabaseUserId || '', { 
          target: targetName, 
          isSectionLeader: newValue 
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
