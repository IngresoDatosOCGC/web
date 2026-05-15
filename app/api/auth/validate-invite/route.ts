import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`validate-invite:${ip}`, 5)) {
      return new NextResponse(JSON.stringify({ error: "Demasiados intentos. Espera un momento." }), { status: 429 });
    }

    const { code } = await req.json();

    if (!code) return new NextResponse(JSON.stringify({ error: "No se proporcionó el código" }), { status: 400 });

    const invitation = await prisma.invitationCode.findUnique({
      where: { code }
    });

    if (!invitation) {
      return new NextResponse(JSON.stringify({ error: "Código inválido o no encontrado" }), { status: 404 });
    }

    if (invitation.usedAt) {
      return new NextResponse(JSON.stringify({ error: "Este código ya ha sido utilizado" }), { status: 410 });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return new NextResponse(JSON.stringify({ error: "Este código ha caducado (7 días transcurridos)" }), { status: 410 });
    }

    return NextResponse.json({ 
      success: true,
      name: invitation.name || '',
      surname: invitation.surname || '',
      agrupacion: invitation.agrupacion,
      seccion: invitation.seccion,
      agrupacion2: invitation.agrupacion2,
      seccion2: invitation.seccion2,
      agrupacion3: invitation.agrupacion3,
      seccion3: invitation.seccion3,
      isla: invitation.isla,
      hasCertificate: invitation.hasCertificate
    });
  } catch (error) {
    console.error("Error validando código:", error);
    return new NextResponse(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
}
