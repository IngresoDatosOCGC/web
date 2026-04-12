import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildVisibleScoresWhereInput } from "@/lib/score-visibility";
import { getSessionUser } from "@/lib/auth-utils";

const scoreListArgs = {
  include: { category: true as const },
  orderBy: { createdAt: "desc" as const },
};

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Si es Master o Archivero, ve todo el archivo digital
    if (user.isMaster || user.isArchiver) {
      const allScores = await prisma.score.findMany(scoreListArgs);
      return NextResponse.json(allScores);
    }

    // Buscamos el perfil detallado para ver qué partituras le corresponden
    const [dbUserFull, seccionesDB] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        include: {
          estructuras: {
            where: { activo: true },
            include: { seccion: true, agrupacion: true },
          },
        },
      }),
      prisma.seccion.findMany({ select: { seccion: true } }),
    ]);

    const userStructures =
      dbUserFull?.estructuras.map((est) => ({
        agrupacion: est.agrupacion.agrupacion,
        seccion: est.seccion.seccion,
      })) ?? [];

    // Ahora los roles/secciones vienen de la DB, no de metadata
    const userRoles = dbUserFull?.estructuras.filter(e => e.activo).map(e => e.seccion.seccion) || [];
    const predefinedSeccionNames = seccionesDB.map((s) => s.seccion);

    const whereVisible = buildVisibleScoresWhereInput(
      userStructures,
      userRoles,
      predefinedSeccionNames
    );

    const filteredScores = await prisma.score.findMany({
      ...scoreListArgs,
      where: whereVisible,
    });

    return NextResponse.json(filteredScores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return new NextResponse("Database Error", { status: 500 });
  }
}
