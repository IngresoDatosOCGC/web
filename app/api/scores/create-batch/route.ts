import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  const isMaster = user?.publicMetadata?.isMaster;
  const isArchiver = user?.publicMetadata?.isArchiver;

  if (!isMaster && !isArchiver) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const isDocument = formData.get("isDocument") === "on";
    const roles = formData.getAll("roles") as string[];
    const fileUrl = formData.get("fileUrl") as string;

    if (!title || !fileUrl) {
      return new NextResponse("Faltan campos requeridos", { status: 400 });
    }

    const newScore = await prisma.score.create({
      data: {
        title: title,
        fileUrl: fileUrl,
        categoryId: categoryId ? parseInt(categoryId) : null,
        isDocument: isDocument,
        allowedRoles: roles,
      }
    });

    // Auditoría
    await prisma.activityLog.create({
      data: {
        action: "Batch CSV Import",
        details: `Importada obra '${title}' desde CSV`,
        userClerkId: userId
      }
    });

    return NextResponse.json(newScore);
  } catch (error) {
    console.error("Error creating score via batch:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
