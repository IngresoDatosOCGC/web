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
    const { 
      email, username, firstName, lastName, dni, roles, isMaster, isArchiver, isSeller, isExternal, 
      agrupacion, seccion, papel, matricula, phone, birthDate, activo, atril, isla, municipio, empadronamiento, trabajo, estudios 
    } = data;

    if (!firstName || !lastName || !dni) {
      return NextResponse.json({ error: "Nombre, Apellidos y DNI son obligatorios" }, { status: 400 });
    }

    let supabaseUser: any = null;

    const dniUpper = String(dni).toUpperCase().trim();
    const finalUsername = username || dniUpper;
    const finalIsExternal = email ? !!isExternal : true; // Si no hay email, obligatoriamente externo

    // 1. Verificar si el usuario ya existe localmente (por múltiples roles en CSV)
    const existingDbUser = await prisma.user.findUnique({ 
      where: { dni: String(dni) },
      include: { estructuras: { include: { agrupacion: true, seccion: true, papel: true } } } 
    });

    // 1.5 Early exit: Si el usuario existe y ya tiene asignada la misma estructura exacta, nos saltamos la fila por rendimiento
    if (existingDbUser && agrupacion && seccion && papel) {
      const exactStructureExists = existingDbUser.estructuras.some(e => 
        e.agrupacion.agrupacion === agrupacion &&
        e.seccion.seccion === seccion &&
        e.papel.papel === papel
      );

      if (exactStructureExists) {
        return NextResponse.json({ success: true, skipped: true, userId: existingDbUser.id });
      }
    }

    if (existingDbUser && existingDbUser.supabaseUserId) {
      // Rehusamos el usuario de Supabase ya que ya le pertenece a esta persona
      supabaseUser = { id: existingDbUser.supabaseUserId };
    } else if (!finalIsExternal && email) {
      // 2. Intentar crear usuario en Supabase si no existe
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          password: dniUpper,
          user_metadata: {
            full_name: `${firstName} ${lastName}`.trim(),
            username: finalUsername
          },
      });

      if (createError) {
        if (createError.status === 422 || createError.code === 'email_exists' || createError.message.includes('registered')) {
          // El usuario ya existe en Supabase (tal vez de importaciones previas o desincronización)
          // Recuperamos su ID para no perder la coherencia.
          const { data: searchResults } = await supabaseAdmin.auth.admin.listUsers();
          const existingSupa = searchResults.users.find(u => u.email === email);
          if (existingSupa) {
            supabaseUser = existingSupa;
          }
        } else {
          // Es un error real distinto
          throw createError;
        }
      } else {
        supabaseUser = created.user;
      }
    }

    // Identificar o crear Residencia
    let residenciaId = undefined;
    if (isla || municipio || empadronamiento) {
      let r = await prisma.residencia.findFirst({
        where: { isla: isla || null, municipio: municipio || null, empadronamiento: empadronamiento || null }
      });
      if (!r) {
        r = await prisma.residencia.create({
          data: { isla: isla || null, municipio: municipio || null, empadronamiento: empadronamiento || null }
        });
      }
      residenciaId = r.id;
    }

    // Identificar o crear Empleo
    let empleoId = undefined;
    if (trabajo || estudios) {
      let e = await prisma.empleo.findFirst({
        where: { trabajo: trabajo || null, estudios: estudios || null }
      });
      if (!e) {
        e = await prisma.empleo.create({
          data: { trabajo: trabajo || null, estudios: estudios || null }
        });
      }
      empleoId = e.id;
    }

    // 3. Sincronizar con la Base de Datos Local (Prisma) - Fuente de Verdad
    const dbUser = await prisma.user.upsert({
      where: { dni: String(dni) },
      update: {
        supabaseUserId: supabaseUser?.id || undefined,
        name: firstName,
        surname: lastName,
        email: email || null,
        username: finalUsername,
        phone: phone || null,
        birthDate: birthDate || null,
        isExternal: finalIsExternal,
        isMaster: !!isMaster,
        isArchiver: !!isArchiver,
        isSeller: !!isSeller,
        isActive: true,
        ...(residenciaId ? { residenciaId } : {}),
        ...(empleoId ? { empleoId } : {})
      },
      create: {
        supabaseUserId: supabaseUser?.id || null,
        name: firstName,
        surname: lastName,
        dni: String(dni),
        email: email || null,
        username: finalUsername,
        phone: phone || null,
        birthDate: birthDate || null,
        isExternal: finalIsExternal,
        isMaster: !!isMaster,
        isArchiver: !!isArchiver,
        isSeller: !!isSeller,
        isActive: true,
        residenciaId: residenciaId || null,
        empleoId: empleoId || null
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
      // Mapa de normalización: algunos CSV usan nombres históricos distintos a los de la BD
      const AGRUPACION_ALIASES: Record<string, string> = {
        "Coro OCGC": "Coro",
        "Coro Donna Voce": "Coro",
        "Orquesta Comunitaria Gran Canaria": "Orquesta",
        "Orquesta OCGC": "Orquesta",
        "Ensemble Violonchelos": "Ensemble Chelos",
        "Ensemble Violonchelo": "Ensemble Chelos",
      };
      const canonicalAgrupacion = AGRUPACION_ALIASES[agrupacion] ?? agrupacion;

      const [dbAgrup, dbSeccion, dbPapel] = await Promise.all([
        prisma.agrupacion.findUnique({ where: { agrupacion: canonicalAgrupacion } }),
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
          update: { 
            activo: activo ?? true,
            atril: atril ?? null
          },
          create: {
            userId: dbUser.id,
            papelId: dbPapel.id,
            agrupacionId: dbAgrup.id,
            seccionId: dbSeccion.id,
            activo: activo ?? true,
            atril: atril ?? null
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
