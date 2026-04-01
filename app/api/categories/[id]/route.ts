import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  const isMaster = !!user?.publicMetadata?.isMaster;
  if (!isMaster) return new NextResponse("Forbidden", { status: 403 });

  const resolvedParams = await params;

  try {
    await prisma.category.delete({
      where: { id: parseInt(resolvedParams.id) }
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
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  const isMaster = !!user?.publicMetadata?.isMaster;
  if (!isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { name, eventDate } = await req.json();

  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const resolvedParams = await params;

  try {
    const updated = await prisma.category.update({
      where: { id: parseInt(resolvedParams.id) },
      data: { 
        name,
        eventDate: eventDate ? new Date(eventDate) : null
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    return new NextResponse("Error updating category", { status: 500 });
  }
}
