import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (!user.user_metadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

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
