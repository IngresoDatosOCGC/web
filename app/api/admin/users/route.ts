import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { logActivity } from "@/lib/logger";
import prisma from "@/lib/prisma";

// Cliente Admin para listar y actualizar metadatos sin restricción
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Solo el Master puede gestionar músicos
  if (!user?.user_metadata?.isMaster) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [supabaseResponse, dbUsers] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      prisma.user.findMany({
        include: {
          estructuras: {
            include: {
              agrupacion: true,
              seccion: true,
              papel: true
            }
          }
        }
      })
    ]);

    const members = supabaseResponse.data.users.map(u => {
      const dbUser = dbUsers.find(db => db.supabaseUserId === u.id);
      return {
        id: u.id,
        name: u.user_metadata?.full_name || u.email?.split('@')[0] || "Sin nombre",
        email: u.email || "Sin email",
        roles: (u.user_metadata?.roles as string[]) || [], 
        isArchiver: !!u.user_metadata?.isArchiver,
        isMaster: !!u.user_metadata?.isMaster,
        isBanned: !!u.banned_until || (dbUser ? !dbUser.isActive : false),
        isActive: dbUser ? dbUser.isActive : true,
        isExternal: false,
        // Datos de nuestra DB
        dbId: dbUser?.id,
        birthDate: dbUser?.birthDate,
        hasCertificate: !!dbUser?.hasCertificate,
        estructuras: dbUser?.estructuras.map(e => ({
          id: e.id,
          agrupacion: e.agrupacion.agrupacion,
          seccion: e.seccion.seccion,
          papel: e.papel.papel,
          activo: e.activo,
          atril: e.atril
        })) || []
      };
    });

    // Añadir usuarios externos (solo en DB)
    const externalUsers = dbUsers
      .filter(db => !db.supabaseUserId)
      .map(db => ({
        id: `ext_${db.id}`,
        dbId: db.id,
        name: `${db.name} ${db.surname}`.trim() || "Externo sin nombre",
        email: db.email || "—",
        roles: db.estructuras.map(e => e.seccion.seccion),
        isArchiver: false,
        isMaster: false,
        isBanned: !db.isActive,
        isExternal: db.isExternal,
        isActive: db.isActive,
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

    const allMembers = [...members, ...externalUsers];

    return NextResponse.json(allMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    return new NextResponse("Supabase Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.user_metadata?.isMaster) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { userId, roles, action, isArchiver, isMaster, estructuraId, activo, atril } = body;

  try {
      const isLocalOnly = typeof userId === 'string' && userId.startsWith('ext_');
      let targetName = userId;

      // Buscar el ID de la base de datos (dbId) 
      const dbUser = await prisma.user.findFirst({ 
        where: isLocalOnly ? { id: parseInt(userId.replace('ext_', '')) } : { supabaseUserId: userId } 
      });
      
      if (dbUser) {
        targetName = `${dbUser.name} ${dbUser.surname}`.trim();
      } else {
        return new NextResponse("Usuario no encontrado en la DB local", { status: 404 });
      }

      const dbId = dbUser.id;
      const { syncUserWithSupabase } = await import("@/lib/supabase-sync");

      // Acción para actualizar Roles manuales
      if (action === "update-roles" && !isLocalOnly) {
         const { data: { user: targetAuthUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
         if (targetAuthUser) {
           const currentMetadata = targetAuthUser.user_metadata || {};
           await supabaseAdmin.auth.admin.updateUserById(userId, {
             user_metadata: { ...currentMetadata, roles }
           });
           await syncUserWithSupabase(dbId);
           await logActivity("Actualización de Instrumentos", user.id, { target: targetName, newRoles: roles });
         }
      }

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

         await syncUserWithSupabase(dbId);
         await logActivity(`Perfil ${isBanned ? 'Desactivado' : 'Activado'}`, user.id, { target: targetName });
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

        await syncUserWithSupabase(dbId);
        await logActivity("Estructura Actualizada", user.id, { target: targetName });
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

        await syncUserWithSupabase(dbId);
        await logActivity("Nueva Estructura Añadida", user.id, { target: targetName });
      }

      // Acción para ELIMINAR una estructura
      if (action === "delete-estructura") {
        if (!estructuraId) return new NextResponse("Falta estructuraId", { status: 400 });

        await prisma.estructura.delete({ where: { id: estructuraId } });

        await syncUserWithSupabase(dbId);
        await logActivity("Estructura Eliminada", user.id, { target: targetName });
      }

     // Acción para cambiar permiso de Archivero
     if (action === "toggle-archiver" && !isLocalOnly) {
        const { data: { user: targetAuthUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetAuthUser) {
          const currentMetadata = targetAuthUser.user_metadata || {};
          const newValue = isArchiver !== undefined ? isArchiver : !currentMetadata.isArchiver;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...currentMetadata,
              isArchiver: newValue
            }
          });
          await logActivity("Cambio permiso Archivero", user.id, { 
            target: targetName, 
            isArchiver: newValue 
          });
        }
     }

      // Acción para cambiar permiso de Master
      if (action === "toggle-master" && !isLocalOnly) {
        const { data: { user: targetAuthUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetAuthUser) {
          const currentMetadata = targetAuthUser.user_metadata || {};
          const newValue = isMaster !== undefined ? isMaster : !currentMetadata.isMaster;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...currentMetadata,
              isMaster: newValue
            }
          });
          await logActivity("Cambio permiso Master", user.id, { 
            target: targetName, 
            isMaster: newValue 
          });
        }
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
        await logActivity("Perfil Personal Actualizado", user.id, { target: targetName });
      }

      return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in user action:", err);
    return new NextResponse("Action failed", { status: 500 });
  }
}
