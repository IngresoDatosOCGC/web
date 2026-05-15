import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { buildVisibleScoresWhereInput } from "@/lib/score-visibility";
import { getSessionUser } from "@/lib/auth-utils";

const scoreListArgs = {
  include: { category: true as const },
  orderBy: { createdAt: "desc" as const },
};

export async function GET(req: Request) {
  const user = await getSessionUser();

  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get('limit');
  const take = limitStr ? parseInt(limitStr) : undefined;

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Si es Master o Archivero, ve todo el archivo digital
    if (user.isMaster || user.isArchiver) {
      const allScores = await prisma.score.findMany({ ...scoreListArgs, take });
      
      const supabase = await createClient();
      const urlMap = new Map<string, string>();
      for (const s of allScores) {
        if (s.fileUrl && !s.fileUrl.includes('?token=')) {
          const parts = s.fileUrl.split('/object/');
          if (parts.length >= 2) {
            const subparts = parts[1].split('/');
            const bucket = subparts[1];
            const path = subparts.slice(2).join('/');
            const key = `${bucket}/${path}`;
            if (!urlMap.has(key)) urlMap.set(key, '');
          }
        }
      }
      
      const signedUrls: Record<string, string> = {};
      for (const [key] of urlMap.entries()) {
        const [bucket, ...pathParts] = key.split('/');
        const path = pathParts.join('/');
        try {
          const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
          if (data?.signedUrl) signedUrls[key] = data.signedUrl;
        } catch {}
      }
      
      const signed = allScores.map(s => {
        if (!s.fileUrl || s.fileUrl.includes('?token=')) return s;
        const parts = s.fileUrl.split('/object/');
        if (parts.length < 2) return s;
        const subparts = parts[1].split('/');
        const bucket = subparts[1];
        const path = subparts.slice(2).join('/');
        const key = `${bucket}/${path}`;
        return { ...s, fileUrl: signedUrls[key] || s.fileUrl };
      });
      
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
      take
    });

    const supabase = await createClient();
    const urlMap = new Map<string, string>();
    for (const s of scores) {
      if (s.fileUrl && !s.fileUrl.includes('?token=')) {
        const parts = s.fileUrl.split('/object/');
        if (parts.length >= 2) {
          const subparts = parts[1].split('/');
          const bucket = subparts[1];
          const path = subparts.slice(2).join('/');
          const key = `${bucket}/${path}`;
          if (!urlMap.has(key)) urlMap.set(key, '');
        }
      }
    }

    const signedUrls: Record<string, string> = {};
    for (const [key] of urlMap.entries()) {
      const [bucket, ...pathParts] = key.split('/');
      const path = pathParts.join('/');
      try {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        if (data?.signedUrl) signedUrls[key] = data.signedUrl;
      } catch {}
    }

    const signedScores = scores.map(s => {
      if (!s.fileUrl || s.fileUrl.includes('?token=')) return s;
      const parts = s.fileUrl.split('/object/');
      if (parts.length < 2) return s;
      const subparts = parts[1].split('/');
      const bucket = subparts[1];
      const path = subparts.slice(2).join('/');
      const key = `${bucket}/${path}`;
      return { ...s, fileUrl: signedUrls[key] || s.fileUrl };
    });

    return NextResponse.json(signedScores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return new NextResponse("Database Error", { status: 500 });
  }
}
