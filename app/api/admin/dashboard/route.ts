import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from "@/lib/auth-utils";

export async function GET() {
  const admin = await getSessionUser();

  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  // Verificar admin vía DB (Fuente de verdad definitiva)
  if (!admin.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const totalUsers = await prisma.user.count();
    const totalScores = await prisma.score.count();
    const totalEvents = await prisma.event.count();

    const totalBanned = await prisma.user.count({ 
      where: { isActive: false } 
    });

    const agrupaciones = await prisma.agrupacion.findMany({
      include: {
        estructuras: {
          include: {
            seccion: true
          }
        }
      }
    });

    const AGRUPACION_ORDER = [
      "Orquesta", "Coro",
      "Ensemble Flautas", "Ensemble Metales", "Ensemble Chelos",
      "Big Band",
      "Colaboradores", "Invitados", "Empresa Externa"
    ];

    const statsArray = agrupaciones
      .map(a => {
        const sectionCounts: Record<string, number> = {};
        a.estructuras.forEach(e => {
          const secName = e.seccion?.seccion || "Otro";
          sectionCounts[secName] = (sectionCounts[secName] || 0) + 1;
        });

        return {
          name: a.agrupacion,
          count: a.estructuras.length,
          sections: Object.entries(sectionCounts).map(([name, count]) => ({ name, count }))
        };
      })
      .sort((a, b) => {
        const iA = AGRUPACION_ORDER.indexOf(a.name);
        const iB = AGRUPACION_ORDER.indexOf(b.name);
        const rankA = iA === -1 ? 999 : iA;
        const rankB = iB === -1 ? 999 : iB;
        return rankA - rankB;
      });

    return NextResponse.json({
      totalUsers,
      totalScores,
      totalEvents,
      totalBanned,
      agrupacionesStats: statsArray,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
