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
  const isArchiver = !!user?.publicMetadata?.isArchiver || !!user?.publicMetadata?.isMaster;
  if (!isArchiver) return new NextResponse("Forbidden", { status: 403 });

  const resolvedParams = await params;

  try {
    await prisma.score.delete({
      where: { id: parseInt(resolvedParams.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error Prisma DELETE score:", error);
    return new NextResponse("Error deleting score", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  const isArchiver = !!user?.publicMetadata?.isArchiver || !!user?.publicMetadata?.isMaster;
  if (!isArchiver) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const { title, categoryId, allowedRoles, isDocument } = body;
  
  const resolvedParams = await params;
  const scoreId = parseInt(resolvedParams.id);

  try {
    // Construir objeto de actualización dinámicamente
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isDocument !== undefined) updateData.isDocument = isDocument;

    // Si viene allowedRoles, al ser ahora un array de strings (String[]), lo asignamos directo
    if (allowedRoles !== undefined) {
      updateData.allowedRoles = allowedRoles;
    }

    const updated = await prisma.score.update({
      where: { id: scoreId },
      data: updateData,
      include: { category: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error Prisma PATCH score:", error);
    return new NextResponse("Error updating score", { status: 500 });
  }
}
