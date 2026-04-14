import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncUserMetadata } from "@/lib/supabase-sync";

// Cliente Admin para crear el usuario en Auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName, surname, dni, email, phone, dob,
      agrupacion, instrument,
      isla, municipio, empadronamiento,
      trabajo, estudios,
      username, password,
      hasCertificate,
      inviteCode
    } = data;

    // 0. Validar y consumir el código de invitación
    if (!inviteCode) return new NextResponse(JSON.stringify({ error: "Se requiere un código de invitación válido." }), { status: 400 });
    
    const invite = await prisma.invitationCode.findUnique({ where: { code: inviteCode } });
    if (!invite) return new NextResponse(JSON.stringify({ error: "Código de invitación no encontrado." }), { status: 404 });
    if (invite.usedAt) return new NextResponse(JSON.stringify({ error: "Este código ya ha sido utilizado." }), { status: 410 });
    if (new Date(invite.expiresAt) < new Date()) return new NextResponse(JSON.stringify({ error: "Este código ha caducado." }), { status: 410 });

    const groupPairs = [
      { ag: data.agrupacion, inst: data.instrument },
      { ag: data.agrupacion2, inst: data.instrument2 },
      { ag: data.agrupacion3, inst: data.instrument3 }
    ].filter(p => p.ag && p.inst);

    // 1. Crear el usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${surname}`.trim(),
        username: username
      }
    });

    if (authError) throw authError;

    const papelMusico = await prisma.papel.findUnique({ where: { papel: "Músico" } });
    if (!papelMusico) throw new Error("Papel 'Músico' no encontrado en el catálogo.");

    // 2. Buscar/Crear Residencia y Empleo
    const [residenciaRecord, empleoRecord] = await Promise.all([
      prisma.residencia.upsert({
        where: {
          isla_municipio_empadronamiento: {
            isla: isla || null,
            municipio: municipio || null,
            empadronamiento: empadronamiento || null
          }
        },
        create: { isla: isla || null, municipio: municipio || null, empadronamiento: empadronamiento || null },
        update: {}
      }),
      prisma.empleo.upsert({
        where: {
          trabajo_estudios: {
            trabajo: trabajo || null,
            estudios: estudios || null
          }
        },
        create: { trabajo: trabajo || null, estudios: estudios || null },
        update: {}
      })
    ]);

    // 3. Crear o Actualizar el usuario principal (Fuente de Verdad)
    const newUser = await prisma.user.upsert({
      where: { dni: dni || "" },
      update: {
        supabaseUserId: authUser.user.id,
        name: firstName,
        surname: surname || "",
        email: email,
        username: username || null,
        phone: phone || null,
        birthDate: dob || null,
        hasCertificate: !!hasCertificate,
        residenciaId: residenciaRecord.id,
        empleoId: empleoRecord.id,
        isExternal: false,
        isActive: true
      },
      create: {
        supabaseUserId: authUser.user.id,
        name: firstName,
        surname: surname || "",
        dni: dni || "",
        email: email,
        username: username || null,
        phone: phone || null,
        birthDate: dob || null,
        hasCertificate: !!hasCertificate,
        residenciaId: residenciaRecord.id,
        empleoId: empleoRecord.id,
        isExternal: false,
        isActive: true
      }
    });

    // 4. Estructuras
    for (const pair of groupPairs) {
      const dbAgrup = await prisma.agrupacion.findUnique({ where: { agrupacion: pair.ag } });
      const dbInst = await prisma.seccion.findUnique({ where: { seccion: pair.inst } });
      
      if (dbAgrup && dbInst) {
        await prisma.estructura.upsert({
          where: {
            userId_papelId_agrupacionId_seccionId: {
              userId: newUser.id,
              papelId: papelMusico.id,
              agrupacionId: dbAgrup.id,
              seccionId: dbInst.id
            }
          },
          update: { activo: true },
          create: {
            userId: newUser.id,
            papelId: papelMusico.id,
            agrupacionId: dbAgrup.id,
            seccionId: dbInst.id,
            activo: true
          }
        });
      }
    }

    // 5. Marcar código como usado AHORA que todo salió bien
    await prisma.invitationCode.update({
      where: { id: invite.id },
      data: { usedAt: new Date() }
    });

    // 🔄 Sincronizar caché de app_metadata para el nuevo usuario
    await syncUserMetadata(newUser.id);

    return NextResponse.json({ success: true, userId: authUser.user.id, dbId: newUser.id });
  } catch (error: any) {
    console.error("Error Registrando Miembro:", error);
    let errorMessage = error.message || "Error desconocido en el registro";
    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes("dni")) errorMessage = "El DNI ya está registrado.";
      else if (target.includes("email")) errorMessage = "El correo ya está registrado.";
      else errorMessage = "Ya existe un registro con esos datos.";
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
}
