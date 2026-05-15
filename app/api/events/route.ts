import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const limit = searchParams.get('limit');
  const take = limit ? parseInt(limit) : undefined;
  const isUpcoming = searchParams.get('upcoming') === 'true';

  let dateFilter = undefined;
  if (isUpcoming) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateFilter = { gte: today };
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
        ...(dateFilter ? { date: dateFilter } : {})
      },
      orderBy: { date: 'asc' },
      take: take,
      include: { category: { select: { id: true, name: true } } }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching public events:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
