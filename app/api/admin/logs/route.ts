import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200 // Limit to last 200 logs
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
