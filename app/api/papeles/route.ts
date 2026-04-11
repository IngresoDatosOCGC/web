import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get("public") === "true";

  const papeles = await prisma.papel.findMany({ 
    where: isPublic ? { isVisibleInPublic: true } : undefined,
    orderBy: { papel: "asc" } 
  });
  return NextResponse.json(papeles);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name, isVisibleInPublic, isDirector } = await req.json();
  if (!name) return new NextResponse("Name missing", { status: 400 });

  try {
    const created = await prisma.papel.create({
      data: { 
        papel: name,
        isVisibleInPublic: isVisibleInPublic !== undefined ? isVisibleInPublic : true,
        isDirector: isDirector !== undefined ? isDirector : false
      }
    });
    await logActivity("Papel Artístico Creada", user.id, { name });
    return NextResponse.json(created);
  } catch (error) {
    return new NextResponse("Error creating papel", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const { id, name, isVisibleInPublic, isDirector } = await req.json();
    if (!id) return new NextResponse("ID missing", { status: 400 });

    const updated = await prisma.papel.update({
      where: { id: parseInt(id) },
      data: { 
        papel: name,
        isVisibleInPublic: isVisibleInPublic !== undefined ? isVisibleInPublic : undefined,
        isDirector: isDirector !== undefined ? isDirector : undefined
      }
    });

    await logActivity("Papel Actualizado", user.id, { id, name });
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Error updating papel", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get("id");
  if (!idStr) return new NextResponse("ID missing", { status: 400 });

  try {
    const deleted = await prisma.papel.delete({
      where: { id: parseInt(idStr) }
    });
    await logActivity("Papel Artístico Eliminado", user.id, { name: deleted.papel });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting papel", { status: 500 });
  }
}
