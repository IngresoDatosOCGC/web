import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";
import { getSessionUser } from "@/lib/auth-utils";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const resolvedParams = await params;
  const categoryId = parseInt(resolvedParams.id);

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    
    await prisma.category.delete({
      where: { id: categoryId }
    });

    await logActivity("Programa Eliminado", user.supabaseUserId || '', { 
      id: categoryId, 
      nombre: category?.name || "Desconocido" 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return new NextResponse("Error deleting category", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name, eventDate } = await req.json();

  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const resolvedParams = await params;
  const categoryId = parseInt(resolvedParams.id);

  try {
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { 
        name,
        eventDate: eventDate ? new Date(eventDate) : null
      }
    });

    await logActivity("Programa Editado", user.supabaseUserId || '', { 
      id: categoryId, 
      nuevoNombre: name,
      nuevaFecha: eventDate || "Sin fecha"
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    return new NextResponse("Error updating category", { status: 500 });
  }
}
