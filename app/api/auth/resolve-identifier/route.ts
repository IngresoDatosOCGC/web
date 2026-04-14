import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Resuelve un identificador (email o username) a un correo electrónico real.
 * Esto permite el inicio de sesión con el alias del usuario.
 */
export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Identificador requerido" }, { status: 400 });
    }

    // 1. Si ya es un email, lo devolvemos tal cual
    if (identifier.includes("@")) {
      return NextResponse.json({ email: identifier });
    }

    // 2. Si no es email, buscamos en la DB por username
    const user = await prisma.user.findUnique({
      where: { username: identifier },
      select: { email: true }
    });

    if (user && user.email) {
      return NextResponse.json({ email: user.email });
    }

    // 3. Si no se encuentra, devolvemos el original (Supabase fallará elegantemente)
    return NextResponse.json({ email: identifier, notFound: true });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
