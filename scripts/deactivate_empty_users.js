const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para automatizar la baja global de usuarios que no tienen
 * ninguna participación activa en ninguna agrupación/sección.
 */
async function main() {
  console.log("🚀 Iniciando limpieza de usuarios sin estructuras activas...");
  
  try {
    // 1. Buscar usuarios marcados como activos (Global)
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        estructuras: {
          select: { id: true, activo: true }
        }
      }
    });

    console.log(`🔍 Escaneando ${activeUsers.length} usuarios activos...`);

    // 2. Identificar usuarios que no tienen NINGUNA estructura con activo: true
    const usersToDeactivate = activeUsers.filter(user => {
      // Un usuario debe ser desactivado si todas sus estructuras están inactivas (o no tiene ninguna)
      return !user.estructuras.some(e => e.activo === true);
    });

    if (usersToDeactivate.length === 0) {
      console.log("✅ Todos los usuarios activos tienen al menos una estructura activa. Nada que hacer.");
      return;
    }

    console.log(`⚠️ Se han encontrado ${usersToDeactivate.length} usuarios con todas sus participaciones inactivas.`);

    // 3. Ejecutar la desactivación masiva
    const idsToUpdate = usersToDeactivate.map(u => u.id);
    
    const updateResult = await prisma.user.updateMany({
      where: {
        id: { in: idsToUpdate }
      },
      data: {
        isActive: false
      }
    });

    console.log(`\n✅ ¡Limpieza completada!`);
    console.log(`--------------------------------------------------`);
    console.log(`Total procesados: ${activeUsers.length}`);
    console.log(`Total desactivados: ${updateResult.count}`);
    console.log(`--------------------------------------------------`);
    
    usersToDeactivate.forEach(u => {
      console.log(`[BAJA] ${u.name} ${u.surname} | ID: ${u.id} | DNI: ${u.dni || 'N/A'}`);
    });

  } catch (error) {
    console.error("❌ Error durante la ejecución del script:");
    console.error(error);
  }
}

main()
  .catch(e => {
    console.error("❌ Falla crítica en el script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
