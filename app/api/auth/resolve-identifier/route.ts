import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`resolve-identifier:${ip}`, 10)) {
      return NextResponse.json({ error: "Demasiados intentos. Espera un momento." }, { status: 429 });
    }

    let { identifier } = await req.json();
    identifier = identifier?.trim();

    if (!identifier) {
      return NextResponse.json({ error: "Identificador requerido" }, { status: 400 });
    }

    if (identifier.includes("@")) {
      return NextResponse.json({ email: identifier.toLowerCase() });
    }

    const user = await prisma.user.findFirst({
      where: { username: { equals: identifier, mode: 'insensitive' } },
      select: { email: true }
    });

    if (user && user.email) {
      return NextResponse.json({ email: user.email.toLowerCase() });
    }

    return NextResponse.json({ email: identifier });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
