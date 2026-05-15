import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getSessionUser();

  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  // Verificar admin vía DB (Fuente de verdad definitiva)
  if (!admin.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const [totalUsers, activeUsers, totalScores, totalEvents, totalBanned] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.score.count(),
      prisma.event.count(),
      prisma.user.count({ where: { isActive: false } }),
    ]);

    const agrupaciones = await prisma.agrupacion.findMany({
      include: {
        estructuras: {
          where: {
            activo: true,
            user: {
              isActive: true
            }
          },
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
        const sectionData: Record<string, { total: number, activos: number, familia: string }> = {};
        let agrupCount = 0;
        let agrupActivos = 0;

        const MUSICAL_FAMILIES = ["Cuerda", "Viento Madera", "Viento Metal", "Teclados", "Percusión", "Coro", "Dirección"];
        const MUSICAL_AGRUPACIONES = ["Orquesta", "Coro", "Ensemble Flautas", "Ensemble Metales", "Ensemble Chelos", "Big Band"];

        a.estructuras.forEach(e => {
          const secName = e.seccion?.seccion || "Otro";
          const familia = e.seccion?.familia || "Otros";
          
          // Si es una agrupación musical, ignorar familias no instrumentales/dirección en el conteo total
          if (MUSICAL_AGRUPACIONES.includes(a.agrupacion) && !MUSICAL_FAMILIES.includes(familia)) {
            return;
          }

          if (!sectionData[secName]) {
            sectionData[secName] = { total: 0, activos: 0, familia };
          }
          
          sectionData[secName].total += 1;
          sectionData[secName].activos += 1;
          agrupCount += 1;
          agrupActivos += 1;
        });

        return {
          name: a.agrupacion,
          count: agrupCount,
          activeCount: agrupActivos,
          sections: Object.entries(sectionData).map(([name, data]) => ({ 
            name, 
            count: data.total,
            activeCount: data.activos,
            familia: data.familia
          }))
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
      activeUsers,
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
