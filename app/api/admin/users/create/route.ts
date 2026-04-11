import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();
  
  // Solo el Master puede crear usuarios manualmente
  if (!admin?.user_metadata?.isMaster) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      firstName, surname, email, username, password, dni, phone, matricula,
      isMaster, isArchiver, isExternal,
      artisticProfiles // Array de { agrupacion, seccion, papel }
    } = data;

    if (!firstName || !dni) {
      return new NextResponse(JSON.stringify({ error: "Faltan campos obligatorios para el registro interno (Nombre y DNI)" }), { status: 400 });
    }

    let supabaseUser: any = null;

    const canCreateSupabaseAccount = !isExternal && email && password;

    if (canCreateSupabaseAccount) {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          full_name: `${firstName} ${surname || ""}`.trim(),
          isMaster: !!isMaster,
          isArchiver: !!isArchiver
        }
      });

      if (authError) throw authError;
      supabaseUser = authData.user;
    }

    // 2. Crear el usuario en la DB Local
    const newUser = await prisma.user.upsert({
      where: { dni: String(dni) },
      update: {
        supabaseUserId: supabaseUser?.id || undefined, 
        name: firstName,
        surname: surname,
        email: email || null,
        phone: phone || null,
        isExternal: !!isExternal,
        isActive: true
      },
      create: {
        supabaseUserId: supabaseUser?.id || null,
        name: firstName,
        surname: surname || "",
        dni: String(dni),
        email: email || null,
        phone: phone || null,
        isExternal: !!isExternal,
        isActive: true
      }
    });

    // 3. Matrícula
    if (matricula) {
      await prisma.matricula.upsert({
        where: { matriculaNumber: String(matricula) },
        update: { userId: newUser.id },
        create: { matriculaNumber: String(matricula), userId: newUser.id }
      });
    }

    // 4. Estructuras (UPSERT)
    if (artisticProfiles && artisticProfiles.length > 0) {
      for (const profile of artisticProfiles) {
        const dbAgrup = await prisma.agrupacion.findUnique({ where: { agrupacion: profile.agrupacion } });
        const dbSeccion = await prisma.seccion.findUnique({ where: { seccion: profile.seccion } });
        const dbPapel = await prisma.papel.findUnique({ where: { papel: profile.papel || "Músico" } });

        if (dbAgrup && dbSeccion && dbPapel) {
          await prisma.estructura.upsert({
            where: {
              userId_papelId_agrupacionId_seccionId: {
                userId: newUser.id,
                papelId: dbPapel.id,
                agrupacionId: dbAgrup.id,
                seccionId: dbSeccion.id
              }
            },
            update: { activo: true },
            create: {
              userId: newUser.id,
              papelId: dbPapel.id,
              agrupacionId: dbAgrup.id,
              seccionId: dbSeccion.id,
              activo: true
            }
          });
        }
      }
    }

    // 5. Sincronizar roles avanzados con Supabase
    const { syncUserWithSupabase } = await import("@/lib/supabase-sync");
    await syncUserWithSupabase(newUser.id);

    await logActivity("Manual User Created", admin.id, { 
      supabaseUserId: supabaseUser?.id, 
      name: `${firstName} ${surname}`, 
      isExternal, 
      dni, 
      artisticProfilesCount: artisticProfiles?.length 
    });

    return NextResponse.json({ success: true, user: newUser });

  } catch (error: any) {
    console.error("Error en Creación Manual:", error);
    
    let errorMessage = "Error desconocido en el registro";
    
    // Errores de Prisma (Base de Datos)
    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes("dni")) errorMessage = "El DNI ya está registrado en la base de datos local.";
      else if (target.includes("email")) errorMessage = "El correo ya está registrado en la base de datos local.";
      else errorMessage = "Ya existe un registro con esos datos únicos.";
    }
    // Otros errores (Supabase, etc)
    else {
      errorMessage = error.message || error.toString();
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
}
