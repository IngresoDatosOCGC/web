/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ScoreToRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Ensayo', 'Concierto');

-- DropForeignKey
ALTER TABLE "_ScoreToRole" DROP CONSTRAINT "_ScoreToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScoreToRole" DROP CONSTRAINT "_ScoreToRole_B_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "eventDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isDocument" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "_ScoreToRole";

-- CreateTable
CREATE TABLE "Seccion" (
    "id" SERIAL NOT NULL,
    "seccion" TEXT NOT NULL,
    "familia" TEXT DEFAULT 'Otros',

    CONSTRAINT "Seccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "residenciaId" INTEGER,
    "empleoId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estructura" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "papelId" INTEGER NOT NULL,
    "agrupacionId" INTEGER NOT NULL,
    "seccionId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "atril" INTEGER,
    "programaAnterior" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Estructura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Residencia" (
    "id" SERIAL NOT NULL,
    "isla" TEXT,
    "municipio" TEXT,
    "empadronamiento" TEXT,

    CONSTRAINT "Residencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleo" (
    "id" SERIAL NOT NULL,
    "trabajo" TEXT,
    "estudios" TEXT,

    CONSTRAINT "Empleo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" SERIAL NOT NULL,
    "matriculaNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agrupacion" (
    "id" SERIAL NOT NULL,
    "agrupacion" TEXT NOT NULL,

    CONSTRAINT "Agrupacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Papel" (
    "id" SERIAL NOT NULL,
    "papel" TEXT NOT NULL,

    CONSTRAINT "Papel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "forWhom" TEXT,
    "sentToEmail" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "registeredUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'Ensayo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userClerkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seccion_seccion_key" ON "Seccion"("seccion");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Estructura_userId_papelId_agrupacionId_seccionId_key" ON "Estructura"("userId", "papelId", "agrupacionId", "seccionId");

-- CreateIndex
CREATE UNIQUE INDEX "Residencia_isla_municipio_empadronamiento_key" ON "Residencia"("isla", "municipio", "empadronamiento");

-- CreateIndex
CREATE UNIQUE INDEX "Empleo_trabajo_estudios_key" ON "Empleo"("trabajo", "estudios");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_matriculaNumber_key" ON "Matricula"("matriculaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Agrupacion_agrupacion_key" ON "Agrupacion"("agrupacion");

-- CreateIndex
CREATE UNIQUE INDEX "Papel_papel_key" ON "Papel"("papel");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_code_key" ON "InvitationCode"("code");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_type_date_idx" ON "Event"("type", "date");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userClerkId_idx" ON "ActivityLog"("userClerkId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_residenciaId_fkey" FOREIGN KEY ("residenciaId") REFERENCES "Residencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_empleoId_fkey" FOREIGN KEY ("empleoId") REFERENCES "Empleo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estructura" ADD CONSTRAINT "Estructura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estructura" ADD CONSTRAINT "Estructura_papelId_fkey" FOREIGN KEY ("papelId") REFERENCES "Papel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estructura" ADD CONSTRAINT "Estructura_agrupacionId_fkey" FOREIGN KEY ("agrupacionId") REFERENCES "Agrupacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estructura" ADD CONSTRAINT "Estructura_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "Seccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
