import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const isMaster = !!user.user_metadata?.isMaster;
  if (!isMaster) return new NextResponse("Forbidden", { status: 403 });

  const resolvedParams = await params;

  try {
    await prisma.seccion.delete({
      where: { id: parseInt(resolvedParams.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting seccion:", error);
    return new NextResponse("Error deleting seccion", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const isMaster = !!user.user_metadata?.isMaster;
  if (!isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name } = await req.json();

  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const resolvedParams = await params;

  try {
    const updated = await prisma.seccion.update({
      where: { id: parseInt(resolvedParams.id) },
      data: { seccion: name }
    });
    return NextResponse.json({ id: updated.id, name: updated.seccion });
  } catch (error) {
    console.error("Error updating seccion:", error);
    return new NextResponse("Error updating seccion", { status: 500 });
  }
}
