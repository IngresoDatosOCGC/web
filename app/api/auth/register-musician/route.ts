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
  await new Promise(resolve => setTimeout(resolve, 1000));

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

    if (!inviteCode) return new NextResponse(JSON.stringify({ error: "Se requiere un código de invitación válido." }), { status: 400 });

    const now = new Date();
    const consumedInvite = await prisma.invitationCode.updateMany({
      where: { code: inviteCode, usedAt: null, expiresAt: { gte: now } },
      data: { usedAt: now }
    });

    if (consumedInvite.count === 0) {
      const existing = await prisma.invitationCode.findUnique({ where: { code: inviteCode } });
      if (!existing) return new NextResponse(JSON.stringify({ error: "Código de invitación no encontrado." }), { status: 404 });
      if (existing.usedAt) return new NextResponse(JSON.stringify({ error: "Este código ya ha sido utilizado." }), { status: 410 });
      return new NextResponse(JSON.stringify({ error: "Este código ha caducado." }), { status: 410 });
    }

    const groupPairs = [
      { ag: data.agrupacion, inst: data.instrument },
      { ag: data.agrupacion2, inst: data.instrument2 },
      { ag: data.agrupacion3, inst: data.instrument3 }
    ].filter(p => p.ag && p.inst);

    let authUserId: string | null = null;

    try {
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
      authUserId = authUser.user.id;

      const papelMusico = await prisma.papel.findUnique({ where: { papel: "Músico" } });
      if (!papelMusico) throw new Error("Papel 'Músico' no encontrado en el catálogo.");

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

      const newUser = await prisma.user.upsert({
        where: { dni: dni || "" },
        update: {
          supabaseUserId: authUserId,
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
          supabaseUserId: authUserId,
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

      await syncUserMetadata(newUser.id);

      return NextResponse.json({ success: true, userId: authUserId, dbId: newUser.id });
    } catch (innerError: any) {
      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
      }
      await prisma.invitationCode.update({
        where: { code: inviteCode },
        data: { usedAt: null }
      });
      throw innerError;
    }
  } catch (error: any) {
    console.error("Error Registrando Miembro:", error);
    let errorMessage = error.message || "Error desconocido en el registro";
    if (error.code === 'P2002') {
      errorMessage = "No se ha podido completar el registro. Es posible que algunos de los datos introducidos (DNI o Correo) ya existan en nuestro sistema.";
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
}
