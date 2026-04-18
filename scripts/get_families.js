const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const secciones = await prisma.seccion.findMany();
  console.log(secciones.map(s => `${s.seccion} -> ${s.familia}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
