import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      include: {
        residencia: true,
        empleo: true,
        estructuras: {
          include: {
            agrupacion: true,
            seccion: true,
            papel: true
          }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, surname, dni, phone, birthDate, hasCertificate,
      username, currentPassword, password,
      isla, municipio, empadronamiento,
      trabajo, estudios
    } = body;

    // 1. Manage relationships (Residencia & Empleo)
    const [residenciaRecord, empleoRecord] = await Promise.all([
      prisma.residencia.upsert({
        where: { isla_municipio_empadronamiento: { isla: isla || null, municipio: municipio || null, empadronamiento: empadronamiento || null } },
        create: { isla: isla || null, municipio: municipio || null, empadronamiento: empadronamiento || null },
        update: {}
      }),
      prisma.empleo.upsert({
        where: { trabajo_estudios: { trabajo: trabajo || null, estudios: estudios || null } },
        create: { trabajo: trabajo || null, estudios: estudios || null },
        update: {}
      })
    ]);

    // 2. Update local DB user
    const dbUser = await prisma.user.update({
      where: { supabaseUserId: user.id },
      data: {
        name,
        surname,
        dni,
        phone,
        birthDate: birthDate || null,
        hasCertificate,
        username: username,
        residenciaId: residenciaRecord.id,
        empleoId: empleoRecord.id
      }
    });
    
    // 3. Update Supabase Auth metadata and password if required
    const createClientAdmin = (await import("@supabase/supabase-js")).createClient;
    const supabaseAdmin = createClientAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updateAuthData: any = {};
    
    if (name || surname || username) {
        updateAuthData.user_metadata = { 
            full_name: `${name || dbUser.name} ${surname || dbUser.surname}`.trim(), 
            username: username || dbUser.username 
        };
    }

    if (password && password.length >= 8) {
        if (!currentPassword) {
            return NextResponse.json({ error: "Se requiere la contraseña actual para cambiarla" }, { status: 400 });
        }
        
        // Verificamos la contraseña actual intentando un login "silencioso"
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword
        });

        if (verifyError) {
            return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
        }

        updateAuthData.password = password;
    }

    if (Object.keys(updateAuthData).length > 0) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, updateAuthData);
    }

    return NextResponse.json({ success: true, dbUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
