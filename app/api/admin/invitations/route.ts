import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET /api/admin/invitations - Listar invitaciones activas
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  if (!user?.publicMetadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const invitations = await prisma.invitationCode.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(invitations);
  } catch (error) {
    return new NextResponse("Error fetching", { status: 500 });
  }
}

// POST /api/admin/invitations - Crear nueva invitación
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  if (!user?.publicMetadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { forWhom } = await req.json();

  try {
    // Generar un token de alta entropía (128 bits = 16 bytes = 32 caracteres hex)
    // Sin prefijos, puramente aleatorio y criptográfico
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Caduca en 7 días

    const invitation = await prisma.invitationCode.create({
      data: {
        code: token,
        forWhom,
        expiresAt
      }
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error creating invitation:", error);
    return new NextResponse("Error creating", { status: 500 });
  }
}

// DELETE /api/admin/invitations?id=XXX - Revocar manualmente
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  if (!user?.publicMetadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("ID Missing", { status: 400 });

  try {
    await prisma.invitationCode.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting", { status: 500 });
  }
}
