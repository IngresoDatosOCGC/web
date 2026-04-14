import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { syncUserMetadata } from "@/lib/supabase-sync";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const admin = await getSessionUser();
  if (!admin?.isMaster) {
    return new NextResponse("Forbidden - Only Masters can import users", { status: 403 });
  }

  try {
    const data = await req.json();
    const { email, username, firstName, lastName, dni, roles, isMaster, isArchiver, isSeller, isExternal, agrupacion, seccion, papel, matricula } = data;

    if (!firstName || !lastName || !dni) {
      return NextResponse.json({ error: "Nombre, Apellidos y DNI son obligatorios" }, { status: 400 });
    }

    let supabaseUser: any = null;

    if (!isExternal && email) {
      // 1. Verificar si el usuario ya existe en Supabase por el email
      const { data: searchResults, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
      if (searchError) throw searchError;
      
      const existingUser = searchResults.users.find(u => u.email === email);
      
      if (existingUser) {
        supabaseUser = existingUser;
      } else {
        // 2. Crear usuario en Supabase si no existe
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              full_name: `${firstName} ${lastName}`.trim(),
              username: username || null
            },
        });
        if (createError) throw createError;
        supabaseUser = created.user;
      }
    }

    // 3. Sincronizar con la Base de Datos Local (Prisma) - Fuente de Verdad
    const dbUser = await prisma.user.upsert({
      where: { dni: String(dni) },
      update: {
        supabaseUserId: supabaseUser?.id || undefined,
        name: firstName,
        surname: lastName,
        email: email || null,
        username: username || null,
        isExternal: !!isExternal,
        isMaster: !!isMaster,
        isArchiver: !!isArchiver,
        isSeller: !!isSeller,
        isActive: true
      },
      create: {
        supabaseUserId: supabaseUser?.id || null,
        name: firstName,
        surname: lastName,
        dni: String(dni),
        email: email || null,
        username: username || null,
        isExternal: !!isExternal,
        isMaster: !!isMaster,
        isArchiver: !!isArchiver,
        isSeller: !!isSeller,
        isActive: true
      }
    });

    // 3.1 Manejar Matrícula si se proporciona
    if (matricula) {
      await prisma.matricula.upsert({
        where: { matriculaNumber: String(matricula) },
        update: { userId: dbUser.id },
        create: { matriculaNumber: String(matricula), userId: dbUser.id }
      });
    }

    // 4. Crear Estructura (Perfil Artístico)
    if (agrupacion && seccion && papel) {
      const [dbAgrup, dbSeccion, dbPapel] = await Promise.all([
        prisma.agrupacion.findUnique({ where: { agrupacion } }),
        prisma.seccion.findUnique({ where: { seccion } }),
        prisma.papel.findUnique({ where: { papel } })
      ]);

      if (dbAgrup && dbSeccion && dbPapel) {
        await prisma.estructura.upsert({
          where: {
            userId_papelId_agrupacionId_seccionId: {
              userId: dbUser.id,
              papelId: dbPapel.id,
              agrupacionId: dbAgrup.id,
              seccionId: dbSeccion.id
            }
          },
          update: { activo: true },
          create: {
            userId: dbUser.id,
            papelId: dbPapel.id,
            agrupacionId: dbAgrup.id,
            seccionId: dbSeccion.id,
            activo: true
          }
        });
      }
    }

    // 🔄 Sincronizar caché de app_metadata (Si tiene cuenta en Supabase)
    if (dbUser.supabaseUserId) {
      await syncUserMetadata(dbUser.id);
    }

    // 6. Registrar en el Log de Actividad
    await prisma.activityLog.create({
      data: {
        action: "Imported Member",
        details: {
          email,
          supabaseUserId: supabaseUser?.id,
          dni,
          agrupacion,
          seccion,
          papel,
          matricula
        },
        userAuthId: admin.supabaseUserId || ''
      }
    });

    return NextResponse.json({ success: true, userId: dbUser.id, supabaseUserId: supabaseUser?.id });

  } catch (error: any) {
    console.error("Error importing user:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
