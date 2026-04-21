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
  const id = searchParams.get("id");

  try {
    // CARGA DETALLADA: Si hay un ID, devolvemos el perfil completo
    if (id) {
       const isLocalOnly = id.startsWith('ext_');
       const user = await prisma.user.findFirst({
         where: isLocalOnly ? { id: parseInt(id.replace('ext_', '')) } : { supabaseUserId: id },
         include: {
           estructuras: {
             include: {
               agrupacion: true,
               seccion: true,
               papel: true
             }
           },
           residencia: true,
           empleo: true,
           matriculas: true
         }
       });

       if (!user) return new NextResponse("Not Found", { status: 404 });

       // Formatear para el frontend
       return NextResponse.json({
         ...user,
         id: user.supabaseUserId || `ext_${user.id}`,
         dbId: user.id,
         firstName: user.name,
         surname: user.surname,
         artisticProfiles: user.estructuras.map(e => ({
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
        isSeller: true,
        isExternal: true,
        estructuras: {
          select: {
            id: true,
            activo: true,
            agrupacion: { select: { agrupacion: true } },
            seccion: { select: { seccion: true } }
          }
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
      isSeller: db.isSeller,
      isExternal: db.isExternal,
      roles: db.estructuras?.filter(e => e.activo).map(e => e.seccion.seccion) || [],
      estructuras: db.estructuras?.map(e => ({
        id: e.id,
        agrupacion: e.agrupacion?.agrupacion || "Desconocida",
        seccion: e.seccion?.seccion || "Sin sección",
        activo: e.activo
      })) || []
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
        const { firstName, surname, birthDate, hasCertificate, dni, phone, email } = body;
        let finalSupabaseUserId = dbUser.supabaseUserId;
        let finalEmail = email !== undefined ? email : dbUser.email;
        let finalIsExternal = dbUser.isExternal;

        // 1. Manejo de Email y Conversión de Externo -> Plataforma
        if (email && email !== dbUser.email) {
          if (dbUser.supabaseUserId) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              dbUser.supabaseUserId,
              { email: email }
            );
            if (updateError) return new NextResponse(`Error Supabase: ${updateError.message}`, { status: 400 });
          } else if (dbUser.isExternal) {
            const userDni = (dni || dbUser.dni).toUpperCase().trim();
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: email,
              password: userDni,
              email_confirm: true,
              user_metadata: {
                full_name: `${firstName || dbUser.name} ${surname || dbUser.surname}`.trim(),
                username: userDni
              }
            });
            if (createError) return new NextResponse(`Error conversón Supabase: ${createError.message}`, { status: 400 });
            
            finalSupabaseUserId = newUser.user.id;
            finalIsExternal = false;
          }
        }

        // 2. Si cambian nombre o DNI y ya es usuario de plataforma, sincronizar metadatos en Supabase
        if (dbUser.supabaseUserId && (firstName || surname || dni)) {
           const newFullName = `${firstName || dbUser.name} ${surname || dbUser.surname}`.trim();
           const newUsername = (dni || dbUser.dni).toUpperCase().trim();
           await supabaseAdmin.auth.admin.updateUserById(dbUser.supabaseUserId, {
             user_metadata: { full_name: newFullName, username: newUsername }
           });
        }

        // 3. Actualización final en DB local
        const newUsername = (dni || dbUser.dni).toUpperCase().trim();
        await prisma.user.update({
          where: { id: dbId },
          data: {
            name: firstName !== undefined ? firstName : undefined,
            surname: surname !== undefined ? (surname || "") : undefined,
            dni: dni !== undefined ? dni : undefined,
            username: newUsername, // Sincronizamos username con el DNI
            phone: phone !== undefined ? phone : undefined,
            email: finalEmail,
            isExternal: finalIsExternal,
            supabaseUserId: finalSupabaseUserId,
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
        
        if (dbUser.isActive !== hasActive) {
          await prisma.user.update({
            where: { id: dbId },
            data: { isActive: hasActive }
          });
        }
      }

      // Acción para cambiar permiso de Archivero
      if (action === "toggle-archiver") {
         const newValue = isArchiver !== undefined ? isArchiver : !dbUser.isArchiver;
         await prisma.user.update({
           where: { id: dbId },
           data: { isArchiver: newValue }
         });
         await logActivity("Cambio permiso Archivero", admin.supabaseUserId || '', { target: targetName, isArchiver: newValue });
         if (dbUser.supabaseUserId) await syncUserMetadata(dbUser.id);
      }

      // Acción para cambiar permiso de Vendedor
      if (action === "toggle-seller") {
        const newValue = isSeller !== undefined ? isSeller : !dbUser.isSeller;
        await prisma.user.update({
          where: { id: dbId },
          data: { isSeller: newValue }
        });
        await logActivity("Cambio permiso Vendedor", admin.supabaseUserId || '', { target: targetName, isSeller: newValue });
        if (dbUser.supabaseUserId) await syncUserMetadata(dbUser.id);
      }

      // Acción para cambiar permiso de Master
      if (action === "toggle-master") {
        const newValue = isMaster !== undefined ? isMaster : !dbUser.isMaster;
        await prisma.user.update({
          where: { id: dbId },
          data: { isMaster: newValue }
        });
        await logActivity("Cambio permiso Master", admin.supabaseUserId || '', { target: targetName, isMaster: newValue });
        if (dbUser.supabaseUserId) await syncUserMetadata(dbUser.id);
      }

      // Acción para cambiar permiso de Jefe de Sección
      if (action === "toggle-section-leader") {
        const { isSectionLeader } = body;
        const newValue = isSectionLeader !== undefined ? isSectionLeader : !dbUser.isSectionLeader;
        await prisma.user.update({
          where: { id: dbId },
          data: { isSectionLeader: newValue }
        });
        await logActivity("Cambio permiso Jefe Sección", admin.supabaseUserId || '', { target: targetName, isSectionLeader: newValue });
        if (dbUser.supabaseUserId) await syncUserMetadata(dbUser.id);
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

      return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in user action:", err);
    return new NextResponse("Action failed", { status: 500 });
  }
}
