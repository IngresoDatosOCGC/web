import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding catalogs...");

  // ── Agrupaciones ──
  const agrupaciones = [
    "Orquesta", "Coro", "Ensemble Flautas", "Ensemble Metales",
    "Ensemble Chelos", "Colaboradores", "Empresa Externa", "Invitados"
  ];
  for (const name of agrupaciones) {
    await prisma.agrupacion.upsert({
      where: { agrupacion: name },
      create: { agrupacion: name },
      update: {},
    });
  }
  console.log(`  ✓ ${agrupaciones.length} agrupaciones`);

  // ── Secciones (antes eran "Roles" e "instrumentos") ──
  const secciones = [
    "Dirección artística y musical (OCGC y Orquesta)",
    "Dirección musical (Ensemble Flautas)",
    "Dirección musical (Ensemble Metales)",
    "Dirección musical (Ensemble Violonchelos)",
    "Dirección musical (Coro)",
    "Violín primero", "Violín segundo", "Viola", "Violonchelo", "Contrabajo",
    "Flauta", "Oboe", "Clarinete", "Requinto", "Fagot", "Contrafagot", "Saxofón",
    "Trompeta", "Trompa", "Trombón", "Tuba", "Bombardino",
    "Arpa", "Piano", "Órgano", "Percusión",
    "Solista",
    "Alto (coro)", "Soprano (coro)", "Bajo (coro)", "Tenor (coro)", "Coach vocal",
    "Colaboradores", "Transportes", "Rider Service", "Brea Producciones",
    "Productora Pedro Ruiz", "Técnico Sonido", "Técnico Sala", "LF Sound",
    "Productora Las Hormigas Negras", "Invitados"
  ];
  for (const name of secciones) {
    await prisma.seccion.upsert({
      where: { seccion: name },
      create: { seccion: name },
      update: {},
    });
  }
  console.log(`  ✓ ${secciones.length} secciones`);

  // ── Papeles ──
  const papeles = ["Músico", "Invitado", "Colaborador", "Empresa Externa"];
  for (const name of papeles) {
    await prisma.papel.upsert({
      where: { papel: name },
      create: { papel: name },
      update: {},
    });
  }
  console.log(`  ✓ ${papeles.length} papeles`);

  console.log("✅ Seed completado");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
