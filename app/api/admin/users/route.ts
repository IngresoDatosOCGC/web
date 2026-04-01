import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();
  
  // Solo el Master puede gestionar músicos
  if (!user?.publicMetadata?.isMaster) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const response = await (await clerkClient()).users.getUserList({ limit: 500 });
    const members = response.data.map(u => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Sin nombre",
      email: u.emailAddresses[0]?.emailAddress || "Sin email",
      roles: (u.publicMetadata?.roles as string[]) || [],
      isArchiver: !!u.publicMetadata?.isArchiver,
      isMaster: !!u.publicMetadata?.isMaster,
      isBanned: !!u.banned
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return new NextResponse("Clerk Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.publicMetadata?.isMaster) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { userId, roles, action, isArchiver, isMaster } = body;

  try {
     // Acción para actualizar Roles (Instrumentos)
     if (action === "update-roles") {
        const currentUser = await (await clerkClient()).users.getUser(userId);
        const currentMetadata = (currentUser.publicMetadata || {}) as any;
        await (await clerkClient()).users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            roles
          }
        });
     }

     // Acción para Banear / Desbanear (Bloquear inicio de sesión)
     if (action === "toggle-ban") {
        const { isBanned } = body;
        if (isBanned) {
          await (await clerkClient()).users.banUser(userId);
        } else {
          await (await clerkClient()).users.unbanUser(userId);
        }
     }

     // Acción para cambiar permiso de Archivero
     if (action === "toggle-archiver") {
        const currentUser = await (await clerkClient()).users.getUser(userId);
        const currentMetadata = (currentUser.publicMetadata || {}) as any;
        await (await clerkClient()).users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            isArchiver: isArchiver !== undefined ? isArchiver : !currentMetadata.isArchiver
          }
        });
     }

     // Acción para cambiar permiso de Master
     if (action === "toggle-master") {
        const currentUser = await (await clerkClient()).users.getUser(userId);
        const currentMetadata = (currentUser.publicMetadata || {}) as any;
        await (await clerkClient()).users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
            isMaster: isMaster !== undefined ? isMaster : !currentMetadata.isMaster
          }
        });
     }

     return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in user action:", err);
    return new NextResponse("Action failed", { status: 500 });
  }
}
