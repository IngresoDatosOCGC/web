import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Resuelve un identificador (email o username) a un correo electrónico real.
 * Esto permite el inicio de sesión con el alias del usuario.
 */
export async function POST(req: Request) {
  try {
    let { identifier } = await req.json();
    identifier = identifier?.trim();

    if (!identifier) {
      return NextResponse.json({ error: "Identificador requerido" }, { status: 400 });
    }

    // 1. Si ya es un email, lo devolvemos tal cual (normalizado a minúsculas)
    if (identifier.includes("@")) {
      return NextResponse.json({ email: identifier.toLowerCase() });
    }

    // 2. Si no es email, buscamos en la DB por username o DNI (insensible a mayúsculas)
    const user = await prisma.user.findFirst({
      where: { username: { equals: identifier, mode: 'insensitive' } },
      select: { email: true }
    });

    if (user && user.email) {
      return NextResponse.json({ email: user.email.toLowerCase() });
    }

    // 3. Si no se encuentra, devolvemos el original (Supabase fallará elegantemente)
    return NextResponse.json({ email: identifier, notFound: true });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
