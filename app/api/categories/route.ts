import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";
import { getSessionUser } from "@/lib/auth-utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name, eventDate } = await req.json();

  const newCategory = await prisma.category.create({
    data: { 
      name,
      eventDate: eventDate ? new Date(eventDate) : null
    }
  });

  await logActivity("Programa Creado", user.supabaseUserId || '', { 
    nombre: name, 
    fecha: eventDate || "Sin fecha" 
  });

  return NextResponse.json(newCategory);
}
