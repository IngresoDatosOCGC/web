const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncAllUsers() {
  console.log("Iniciando sincronización de todos los usuarios...");
  const users = await prisma.user.findMany({
    include: {
      estructuras: {
        where: { activo: true },
        include: { seccion: true }
      }
    }
  });

  for (const user of users) {
    if (!user.supabaseUserId) continue;

    const permissions = [];
    if (user.isMaster) {
      permissions.push('admin:all', 'users:manage', 'scores:manage', 'events:manage');
    }
    if (user.isArchiver || user.isMaster) {
      permissions.push('scores:edit', 'scores:upload', 'scores:view_all');
    }
    if (user.isSeller || user.isMaster) {
      permissions.push('service_b:access');
    }

    const roles = Array.from(new Set(user.estructuras.map(e => e.seccion.seccion)));

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseUserId, {
      app_metadata: {
        isMaster: !!user.isMaster,
        isArchiver: !!user.isArchiver,
        isSeller: !!user.isSeller,
        roles: roles,
        permissions: permissions
      }
    });

    if (error) {
      console.error(`Error con ${user.email || user.dni}:`, error.message);
    } else {
      console.log(`✅ Sincronizado: ${user.name} (Master: ${user.isMaster}, Seller: ${user.isSeller})`);
    }
  }
  
  console.log("Sincronización completada.");
}

syncAllUsers().catch(console.error).finally(() => prisma.$disconnect());
