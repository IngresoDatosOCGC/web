import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    // Buscamos el usuario en nuestra base de datos por su ID de Supabase
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      include: {
        estructuras: {
          where: { activo: true },
          include: {
            seccion: true
          }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // Definición de roles artísticos
    const artisticRoles = Array.from(new Set(dbUser.estructuras.map(e => e.seccion.seccion)));

    // Definición de permisos RBAC basada en los campos de la DB
    const permissions: string[] = [];
    
    if (dbUser.isMaster) {
      permissions.push(
        'admin:all', 
        'users:manage', 
        'events:manage', 
        'scores:manage',
        'audit:view'
      );
    }
    
    if (dbUser.isArchiver || dbUser.isMaster) {
      permissions.push(
        'scores:edit', 
        'scores:view_all',
        'scores:upload'
      );
    }

    if (dbUser.isSeller || dbUser.isMaster) {
      permissions.push('service_b:access');
    }

    // Respondemos con la "Verdad" de la base de datos
    return NextResponse.json({
      dbId: dbUser.id,
      email: dbUser.email,
      fullName: `${dbUser.name} ${dbUser.surname}`.trim(),
      isMaster: !!dbUser.isMaster,
      isArchiver: !!dbUser.isArchiver,
      isSeller: !!dbUser.isSeller,
      isSectionLeader: !!dbUser.isSectionLeader,
      roles: artisticRoles,
      permissions: permissions
    });

  } catch (error) {
    console.error("❌ Error en API /auth/me:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
