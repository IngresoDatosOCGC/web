import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { EventType } from '@prisma/client';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  if (!user?.publicMetadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  if (!user?.publicMetadata?.isMaster) return new NextResponse("Forbidden", { status: 403 });

  try {
    const { title, date, location, description, type } = await req.json();

    // Validar tipo de evento para evitar errores con el Enum
    const validTypes = ['Ensayo', 'Concierto'];
    if (!validTypes.includes(type)) {
      return new NextResponse("Invalid event type", { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        description,
        type: type as EventType
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "Create Event",
        details: JSON.stringify({
          title,
          date,
          type,
          location,
          id: (event as any).id
        }),
        userClerkId: userId
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
