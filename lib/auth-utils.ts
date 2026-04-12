import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    select: {
      id: true,
      email: true,
      isMaster: true,
      isArchiver: true
    }
  });

  return dbUser;
}

export async function checkPermission(perm: 'master' | 'archiver') {
  const user = await getSessionUser();
  if (!user) return false;
  
  if (user.isMaster) return true;
  if (perm === 'archiver' && user.isArchiver) return true;
  
  return false;
}
