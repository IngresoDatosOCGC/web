import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { buildVisibleScoresWhereInput } from "@/lib/score-visibility";

const scoreListArgs = {
  include: { category: true as const },
  orderBy: { createdAt: "desc" as const },
};

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const isMaster = !!user?.publicMetadata?.isMaster;
  const isArchiver = !!user?.publicMetadata?.isArchiver;

  try {
    if (isMaster || isArchiver) {
      const allScores = await prisma.score.findMany(scoreListArgs);
      return NextResponse.json(allScores);
    }

    const [dbUser, seccionesDB] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId: userId },
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
      dbUser?.estructuras.map((est) => ({
        agrupacion: est.agrupacion.agrupacion,
        seccion: est.seccion.seccion,
      })) ?? [];

    const clerkRoles = (user?.publicMetadata?.roles as string[]) || [];
    const predefinedSeccionNames = seccionesDB.map((s) => s.seccion);

    const whereVisible = buildVisibleScoresWhereInput(
      userStructures,
      clerkRoles,
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
