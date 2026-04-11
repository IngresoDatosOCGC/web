import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/members - Fetch all members (Master only)
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.user_metadata?.isMaster) {
    return new NextResponse(
      "Access denied. Only Master users can manage members.",
      { status: 401 }
    );
  }

  try {
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const dbUsers = await prisma.user.findMany();

    const members = authUsers.map((u: any) => {
      const dbUser = dbUsers.find(db => db.supabaseUserId === u.id);
      return {
        id: u.id,
        name: u.user_metadata?.full_name || u.email?.split('@')[0] || "Sin nombre",
        email: u.email || "Sin email",
        roles: u.user_metadata?.roles as string[] || [],
        isArchiver: !!u.user_metadata?.isArchiver,
        isMaster: !!u.user_metadata?.isMaster,
        isBanned: !!u.banned_until || (dbUser ? !dbUser.isActive : false),
        createdAt: u.created_at
      };
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return new NextResponse(
      `Server error while fetching members: ${error.message}`,
      { status: 500 }
    );
  }
}

/**
 * POST /api/members - Perform user actions (Master only)
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();

  if (!admin?.user_metadata?.isMaster) {
    return new NextResponse(
      "Access denied. Only Master users can manage members.",
      { status: 401 }
    );
  }

  const body = await req.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return new NextResponse(
      "Missing required fields: userId and action are required",
      { status: 400 }
    );
  }

  try {
    const { data: { user: targetUser }, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getError || !targetUser) throw new Error("User not found");

    const currentMetadata = targetUser.user_metadata || {};

    switch (action) {
      case "update-roles":
        {
          const { roles } = body;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { ...currentMetadata, roles }
          });
        }
        break;

      case "toggle-ban":
        {
          const { isBanned } = body;
          // In Supabase we can use banned_until or just a flag in our DB
          // Let's use a flag in our DB for consistency with the rest of the app
          await prisma.user.updateMany({
            where: { supabaseUserId: userId },
            data: { isActive: !isBanned }
          });
          
          if (isBanned) {
            // Ban for 100 years
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              ban_duration: "876000h" 
            });
          } else {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              ban_duration: "none"
            });
          }
        }
        break;

      case "toggle-archiver":
        {
          const { isArchiver } = body;
          const newValue = isArchiver === undefined ? !currentMetadata.isArchiver : !!isArchiver;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { ...currentMetadata, isArchiver: newValue }
          });
        }
        break;

      case "toggle-master":
        {
          const { isMaster } = body;
          const newValue = isMaster === undefined ? !currentMetadata.isMaster : !!isMaster;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { ...currentMetadata, isMaster: newValue }
          });
        }
        break;
    }

    return NextResponse.json({
      success: true,
      message: "Action completed successfully"
    });
  } catch (error: any) {
    console.error(`Error in user action "${action}":`, error);
    return new NextResponse(
      `Action failed: ${error.message}`,
      { status: 500 }
    );
  }
}
