import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
      
      const supabase = await createClient();
      const signed = await Promise.all(allScores.map(async (s) => {
        if (!s.fileUrl || s.fileUrl.includes('?token=')) return s;
        try {
          const parts = s.fileUrl.split('/object/');
          if (parts.length < 2) return s;
          const subparts = parts[1].split('/');
          const bucket = subparts[1];
          const path = subparts.slice(2).join('/');
          const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
          return { ...s, fileUrl: data?.signedUrl || s.fileUrl };
        } catch { return s; }
      }));
      
      return NextResponse.json(signed);
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

    const scores = await prisma.score.findMany({
      ...scoreListArgs,
      where: whereVisible,
    });

    // 🔄 Generar URLs firmadas temporales (VUL-03)
    const supabase = await createClient();
    const signedScores = await Promise.all(scores.map(async (s) => {
      if (!s.fileUrl || s.fileUrl.includes('?token=')) return s; // Ya firmada o vacía
      
      try {
        // Asumiendo formato: .../object/public/BUCKET/PATH o .../object/authenticated/BUCKET/PATH
        const parts = s.fileUrl.split('/object/');
        if (parts.length < 2) return s;
        
        const subparts = parts[1].split('/');
        // subparts[0] es "public" o "authenticated"
        const bucket = subparts[1];
        const path = subparts.slice(2).join('/');
        
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        return { ...s, fileUrl: data?.signedUrl || s.fileUrl };
      } catch {
        return s;
      }
    }));

    return NextResponse.json(signedScores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return new NextResponse("Database Error", { status: 500 });
  }
}
