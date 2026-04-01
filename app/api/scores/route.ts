import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Obtenemos los roles/instrumentos del usuario desde su Metadata de Clerk
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isMaster = !!user?.publicMetadata?.isMaster;
  const isArchiver = !!user?.publicMetadata?.isArchiver;

  try {
    // Si eres Master o Archivero, ves TODO
    if (isMaster || isArchiver) {
      const allScores = await prisma.score.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(allScores);
    }

    // 3. Lógica de Dirección Musical:
    // Si un rol empieza por "Dirección musical", le damos acceso a TODO el material de esa agrupación (Tutti)
    const ensembleMappings: Record<string, string> = {
      "Dirección musical (Ensemble Flautas)": "Ensemble Flautas - Tutti",
      "Dirección musical (Ensemble Metales)": "Ensemble Metales - Tutti",
      "Dirección musical (Ensemble Violonchelos)": "Ensemble Chelos - Tutti",
      "Dirección musical (Coro)": "Coro - Tutti",
      "Dirección artística y musical (OCGC y Orquesta)": "Orquesta - Tutti"
    };

    const extraTuttiRoles = userRoles
      .filter(r => r.startsWith("Dirección"))
      .map(r => ensembleMappings[r])
      .filter(Boolean);

    const effectiveRoles = [...new Set([...userRoles, ...extraTuttiRoles])];

    // Si eres Músico, solo ves las partituras que tengan TUS roles
    // O las que no tengan ningún rol asignado (Públicas para todos los miembros)
    const filteredScores = await prisma.score.findMany({
      where: {
        OR: [
          { allowedRoles: { hasSome: effectiveRoles } },
          { allowedRoles: { isEmpty: true } }
        ]
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(filteredScores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return new NextResponse("Database Error", { status: 500 });
  }
}
