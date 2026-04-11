import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get("public") === "true";

  const agrupaciones = await prisma.agrupacion.findMany({ 
    where: isPublic ? { isVisibleInPublic: true } : undefined,
    orderBy: { agrupacion: "asc" } 
  });
  return NextResponse.json(agrupaciones);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name, isVisibleInPublic } = await req.json();
  if (!name) return new NextResponse("Name missing", { status: 400 });

  try {
    const created = await prisma.agrupacion.create({
      data: { 
        agrupacion: name,
        isVisibleInPublic: isVisibleInPublic !== undefined ? isVisibleInPublic : true
      }
    });
    await logActivity("Agrupación Creada", user.id, { name });
    return NextResponse.json(created);
  } catch (error) {
    return new NextResponse("Error creating agrupación", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("ID missing", { status: 400 });

  try {
    const deleted = await prisma.agrupacion.delete({
      where: { id: parseInt(id) }
    });
    await logActivity("Agrupación Eliminada", user.id, { name: deleted.agrupacion });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting agrupación", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const { id, name, isVisibleInPublic } = await req.json();
    if (!id) return new NextResponse("ID missing", { status: 400 });

    const updated = await prisma.agrupacion.update({
      where: { id: parseInt(id) },
      data: { 
        agrupacion: name,
        isVisibleInPublic: isVisibleInPublic !== undefined ? isVisibleInPublic : undefined
      }
    });

    await logActivity("Agrupación Actualizada", user.id, { id, name });
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Error updating agrupación", { status: 500 });
  }
}
