import type { Prisma } from "@prisma/client";

type ScoreStructureRow = {
  agrupacion: string;
  seccion: string;
};

/**
 * Replica la lógica de filtrado en memoria de GET /api/scores en un único
 * Prisma.ScoreWhereInput para que PostgreSQL filtre en la consulta.
 */
export function buildVisibleScoresWhereInput(
  userStructures: ScoreStructureRow[],
  clerkRoles: string[],
  predefinedSeccionNames: string[]
): Prisma.ScoreWhereInput {
  const specialClerkRoles = clerkRoles.filter(
    (r) => !predefinedSeccionNames.includes(r)
  );

  const structureClauses: Prisma.ScoreWhereInput[] = userStructures.map(
    (est) => ({
      AND: [
        {
          OR: [
            { allowedAgrupaciones: { equals: [] } },
            { allowedAgrupaciones: { has: est.agrupacion } },
          ],
        },
        {
          OR: [
            { allowedRoles: { equals: [] } },
            { allowedRoles: { has: est.seccion } },
          ],
        },
      ],
    })
  );

  const orBranches: Prisma.ScoreWhereInput[] = [
    { isDocument: true },
    {
      AND: [
        { allowedRoles: { equals: [] } },
        { allowedAgrupaciones: { equals: [] } },
      ],
    },
    ...structureClauses,
  ];

  if (specialClerkRoles.length > 0) {
    orBranches.push({
      allowedRoles: { hasSome: specialClerkRoles },
    });
  }

  return { OR: orBranches };
}
