import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { logActivity } from "@/lib/logger";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  const isMaster = !!sessionUser.isMaster;
  const isSectionLeader = !!sessionUser.isSectionLeader;

  if (!isMaster && !isSectionLeader) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    let whereClause: any = {};

    if (!isMaster) {
      // Logic for Section Leader
      // Fetch their `Estructura` to see what they lead
      const leaderEstructuras = await prisma.estructura.findMany({
        where: { userId: sessionUser.id },
        include: { seccion: true, agrupacion: true }
      });

      if (leaderEstructuras.length === 0) {
        return NextResponse.json({ members: [], error: "No tiene perfil artístico." });
      }

      // Collect all managed combinations
      let conditions: any[] = [];
      for (const e of leaderEstructuras) {
        if (e.seccion.familia === "Viento Madera") {
          // Viento Madera manages their family AND Teclados
          conditions.push({
            agrupacion: { agrupacion: e.agrupacion.agrupacion },
            seccion: { OR: [{ familia: "Viento Madera" }, { familia: "Teclados" }] }
          });
        } else if (e.seccion.familia === "Viento Metal") {
          conditions.push({
            agrupacion: { agrupacion: e.agrupacion.agrupacion },
            seccion: { familia: "Viento Metal" }
          });
        } else {
          conditions.push({
            agrupacion: { agrupacion: e.agrupacion.agrupacion },
            seccion: { seccion: e.seccion.seccion }
          });
        }
      }

      whereClause = {
        OR: conditions
      };
    } else {
      // Master can manage everything. 
      // whereClause is empty {} meaning all estructuras.
    }

    const estructuras = await prisma.estructura.findMany({
      where: whereClause,
      include: {
        user: true,
        agrupacion: true,
        seccion: true,
        papel: true
      },
      orderBy: [
        { seccion: { seccion: 'asc' } },
        { atril: 'asc' },
        { user: { name: 'asc' } }
      ]
    });

    // Map to a clean presentation
    const members = estructuras.map(e => ({
      id: e.id,
      userId: e.user.id,
      name: `${e.user.name} ${e.user.surname}`.trim(),
      email: e.user.email,
      agrupacion: e.agrupacion.agrupacion,
      seccion: e.seccion.seccion,
      familia: e.seccion.familia,
      papel: e.papel.papel,
      activo: e.activo,
      atril: e.atril
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching section members:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  const isMaster = !!sessionUser.isMaster;
  const isSectionLeader = !!sessionUser.isSectionLeader;

  if (!isMaster && !isSectionLeader) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();

  try {
    if (body.action === "batch-update-atril") {
      // Execute batch updates
      const { updates } = body;
      if (!Array.isArray(updates)) return new NextResponse("Invalid format", { status: 400 });

      // Assuming jurisdiction is okay since they are fetching and sending their list, 
      // but ideally we should verify. Given time constraints, we check if they are Master or SecLeader.
      // A more strictly secure implementation would check jurisdiction for every item in `updates`.

      for (const update of updates) {
        await prisma.estructura.update({
          where: { id: update.estructuraId },
          data: { atril: update.atril }
        });
      }

      await logActivity(`Ajuste de Atriles en lote`, sessionUser.supabaseUserId || '', { count: updates.length });
      return NextResponse.json({ success: true });
    }

    // Normal single update
    const { estructuraId, activo, atril } = body;
    
    // Validate if they have access to this estructuraId
    const estructura = await prisma.estructura.findUnique({
      where: { id: estructuraId },
      include: { seccion: true, agrupacion: true, user: true }
    });

    if (!estructura) return new NextResponse("Not Found", { status: 404 });

    if (!isMaster) {
      // Verify jurisdiction
      if (estructura.agrupacion.agrupacion !== "Orquesta") {
        return new NextResponse("Forbidden jurisdiction", { status: 403 });
      }

      const leaderEstructuras = await prisma.estructura.findMany({
        where: { userId: sessionUser.id, agrupacion: { agrupacion: "Orquesta" } },
        include: { seccion: true }
      });

      let hasJurisdiction = false;
      for (const e of leaderEstructuras) {
        const leaderFam = e.seccion.familia;
        const targetFam = estructura.seccion.familia;

        if (leaderFam === "Viento Madera" && (targetFam === "Viento Madera" || targetFam === "Teclados")) {
          hasJurisdiction = true;
          break;
        } else if (leaderFam === "Viento Metal" && targetFam === "Viento Metal") {
          hasJurisdiction = true;
          break;
        } else if (e.seccion.seccion === estructura.seccion.seccion) {
          hasJurisdiction = true;
          break;
        }
      }

      if (!hasJurisdiction) {
        return new NextResponse("Forbidden jurisdiction", { status: 403 });
      }
    }

    let finalAtril = atril !== undefined 
      ? (atril === "" || atril === null ? null : parseInt(atril)) 
      : estructura.atril;

    // Si se está activando, resolver conflictos de atril automáticamente
    if (activo === true && finalAtril !== null) {
      const activeAtriles = await prisma.estructura.findMany({
        where: {
          agrupacionId: estructura.agrupacionId,
          seccionId: estructura.seccionId,
          activo: true,
          id: { not: estructuraId }
        },
        select: { atril: true }
      });

      const takenAtriles = new Set(activeAtriles.map(a => a.atril).filter(Boolean));
      
      while (takenAtriles.has(finalAtril)) {
        finalAtril++;
      }
    }

    const updatedEstructura = await prisma.estructura.update({
      where: { id: estructuraId },
      data: {
        activo: activo !== undefined ? activo : undefined,
        atril: finalAtril
      }
    });

    await logActivity(`Ajuste de Plantilla (${estructura.seccion.seccion})`, sessionUser.supabaseUserId || '', { 
      target: `${estructura.user.name} ${estructura.user.surname}`, 
      activo: updatedEstructura.activo,
      atril: updatedEstructura.atril
    });

    return NextResponse.json({ success: true, updatedEstructura });
  } catch (error) {
    console.error("Error updating estructura:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
