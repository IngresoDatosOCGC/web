import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const isMaster = !!user.user_metadata?.isMaster;
  if (!isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name, eventDate } = await req.json();

  const newCategory = await prisma.category.create({
    data: { 
      name,
      eventDate: eventDate ? new Date(eventDate) : null
    }
  });

  await logActivity("Programa Creado", user.id, { 
    nombre: name, 
    fecha: eventDate || "Sin fecha" 
  });

  return NextResponse.json(newCategory);
}
