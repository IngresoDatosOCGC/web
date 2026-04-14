import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { getSessionUser } from "@/lib/auth-utils";
import { syncUserMetadata } from "@/lib/supabase-sync";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const admin = await getSessionUser();
  
  if (!admin?.isMaster) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dbId, email, username, password, targetRole, targetValue } = await req.json();

    if (!dbId || !email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios para la activación" }, { status: 400 });
    }

    // 1. Verificar que el usuario existe en la DB local
    const dbUser = await prisma.user.findUnique({
      where: { id: dbId },
      include: { estructuras: { include: { seccion: true } } }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "El usuario no existe en la base de datos" }, { status: 404 });
    }

    if (dbUser.supabaseUserId) {
      return NextResponse.json({ error: "Este usuario ya tiene acceso a la plataforma" }, { status: 400 });
    }

    // 3. Crear el usuario en Supabase (básico)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: `${dbUser.name} ${dbUser.surname}`.trim()
      }
    });

    if (authError) throw authError;
    const supabaseUser = authData.user;

    // 4. Actualizar el usuario en la DB local con el nuevo ID de Supabase e email
    // Aquí marcamos los permisos en la DB (Verdad Única)
    await prisma.user.update({
      where: { id: dbId },
      data: {
        supabaseUserId: supabaseUser.id,
        email: email,
        isExternal: false,
        isMaster: targetRole === 'master' ? !!targetValue : dbUser.isMaster,
        isArchiver: targetRole === 'archiver' ? !!targetValue : dbUser.isArchiver,
        isSeller: targetRole === 'seller' ? !!targetValue : dbUser.isSeller
      }
    });

    // 🔄 Sincronizar caché de app_metadata
    await syncUserMetadata(dbId);

    await logActivity("User Upgraded to Platform", admin.supabaseUserId || '', { 
      dbId, 
      supabaseUserId: supabaseUser.id, 
      name: `${dbUser.name} ${dbUser.surname}`,
      targetRole,
      targetValue
    });

    return NextResponse.json({ success: true, supabaseUserId: supabaseUser.id });

  } catch (error: any) {
    console.error("Error en Upgrade de Usuario:", error);
    return NextResponse.json({ error: error.message || "Error al activar el acceso" }, { status: 500 });
  }
}
