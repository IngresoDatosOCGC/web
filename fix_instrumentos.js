const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INSTRUMENTOS_DICT = {
  "Cuerda": ["Violín primero", "Violín segundo", "Viola", "Violonchelo", "Contrabajo", "Arpa", "Piano"],
  "Viento Madera": ["Flauta", "Oboe", "Clarinete", "Fagot"],
  "Viento Metal": ["Trompeta", "Trompa", "Trombón", "Tuba", "Bombardino"],
  "Coro": ["Soprano (coro)", "Alto (coro)", "Tenor (coro)", "Bajo (coro)"],
  "Tuttis": ["Orquesta - Tutti", "Coro - Tutti", "Ensemble Flautas - Tutti", "Ensemble Metales - Tutti", "Ensemble Chelos - Tutti", "Big Band - Tutti"],
  "Generales": [
    "Dirección artística y musical (OCGC y Orquesta)", 
    "Dirección musical (Ensemble Flautas)", 
    "Dirección musical (Ensemble Metales)", 
    "Dirección musical (Ensemble Violonchelos)", 
    "Dirección musical (Coro)"
  ]
};

async function main() {
  console.log("Iniciando sincronización de familias de instrumentos...");

  for (const [familia, instrumentos] of Object.entries(INSTRUMENTOS_DICT)) {
    for (const nombre of instrumentos) {
      try {
        const result = await prisma.seccion.upsert({
          where: { seccion: nombre },
          update: { familia: familia },
          create: { seccion: nombre, familia: familia }
        });
        console.log(`[OK] ${nombre} -> ${familia}`);
      } catch (e) {
        console.error(`[ERROR] Al procesar ${nombre}:`, e.message);
      }
    }
  }

  console.log("Sincronización finalizada correctamente.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
