import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const EMAIL = "TU_EMAIL_AQUI" // <--- Cambia esto
  const SUPABASE_ID = "TU_UUID_AQUI" // <--- Cambia esto (opcional si usas email)

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      supabaseUserId: SUPABASE_ID,
      isMaster: true,
      isActive: true
    },
    create: {
      email: EMAIL,
      supabaseUserId: SUPABASE_ID,
      name: "Admin",
      surname: "Principal",
      dni: "00000000A",
      isMaster: true,
      isActive: true
    }
  })

  console.log("✅ Usuario Admin creado/vinculado con éxito:", user.email)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
