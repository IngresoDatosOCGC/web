import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const agrupaciones = await prisma.agrupacion.findMany({ orderBy: { agrupacion: "asc" } });
  return NextResponse.json(agrupaciones);
}
