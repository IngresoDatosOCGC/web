import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName, surname, dni, email, phone, dob,
      agrupacion, instrument, desk,
      isla, municipio, empadronamiento,
      trabajo, estudios, vehicleRegistration,
      username, password
    } = data;

    // 1. Preparar los pares Agrupación/Sección para crear la Estructura y Roles
    const groupPairs = [
      { ag: data.agrupacion, inst: data.instrument },
      { ag: data.agrupacion2, inst: data.instrument2 },
      { ag: data.agrupacion3, inst: data.instrument3 }
    ].filter(p => p.ag && p.inst); // Solo los que tengan ambos campos rellenos

    let userRoles = Array.from(new Set(groupPairs.map(p => p.inst)));
    // Asignar roles grupales (Tutti) automáticamente según sus agrupaciones para flexibilizar acceso a partituras
    const agrupacionesSet = new Set(groupPairs.map(p => p.ag));
    if (agrupacionesSet.has("Orquesta Comunitaria Gran Canaria")) userRoles.push("Orquesta - Tutti");
    if (agrupacionesSet.has("Coro Comunitario Gran Canaria")) userRoles.push("Coro - Tutti");
    if (agrupacionesSet.has("Ensemble de Flautas")) userRoles.push("Ensemble Flautas - Tutti");
    if (agrupacionesSet.has("Ensemble de Metales")) userRoles.push("Ensemble Metales - Tutti");
    if (agrupacionesSet.has("Ensemble de Chelos")) userRoles.push("Ensemble Chelos - Tutti");
    if (agrupacionesSet.has("OCGC Big Band")) userRoles.push("Big Band - Tutti");

    // 2. Crear el usuario en Clerk (solo lo esencial)
    const clerkUser = await clerkClient.users.createUser({
      firstName,
      lastName: surname,
      emailAddress: [email],
      username,
      password,
      publicMetadata: { roles: userRoles },
      skipPasswordRequirement: false,
      skipPasswordChecks: true
    });

    const papelMusico = await prisma.papel.findUnique({ where: { papel: "Músico" } });
    if (!papelMusico) throw new Error("Papel 'Músico' no encontrado en el catálogo. Ejecuta el seed.");

    // 3. Buscar/Crear Residencia y Empleo (obligatorios según el nuevo formulario)
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

    // 4. Crear el usuario principal
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: clerkUser.id,
        name: firstName,
        surname: surname || "",
        dni: dni || "",
        email: email,
        phone: phone || null,
        birthDate: dob || null,
        residenciaId: residenciaRecord.id,
        empleoId: empleoRecord.id
      }
    });

    // 5. Crear todas las filas de Estructura solicitadas
    for (const pair of groupPairs) {
      const dbAgrup = await prisma.agrupacion.findUnique({ where: { agrupacion: pair.ag } });
      const dbInst = await prisma.seccion.findUnique({ where: { seccion: pair.inst } });
      
      if (dbAgrup && dbInst) {
        await prisma.estructura.create({
          data: {
            userId: newUser.id,
            papelId: papelMusico.id,
            agrupacionId: dbAgrup.id,
            seccionId: dbInst.id,
            activo: true
          }
        });
      }
    }

    return NextResponse.json({ success: true, userId: clerkUser.id, dbId: newUser.id });
  } catch (error: any) {
    console.error("Error Registrando Miembro:", error);
    
    let errorMessage = "Error desconocido en el registro";
    
    // Si el error viene de Clerk
    if (error.clerkError || error.errors) {
      errorMessage = error.errors?.[0]?.message || error.message || "Error en el servicio de autenticación (Clerk)";
    } 
    // Si el error viene de Prisma por campos duplicados (P2002)
    else if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes("dni")) errorMessage = "El DNI ya está registrado.";
      else if (target.includes("email")) errorMessage = "El correo ya está registrado.";
      else errorMessage = "Ya existe un registro con esos datos.";
    }
    // Otros errores
    else {
      errorMessage = error.message || error.toString();
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
}
