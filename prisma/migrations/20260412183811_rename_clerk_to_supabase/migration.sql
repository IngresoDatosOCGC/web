/*
  Warnings:

  - You are about to drop the column `userClerkId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `forWhom` on the `InvitationCode` table. All the data in the column will be lost.
  - You are about to drop the column `clerkUserId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supabaseUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `familia` on table `Seccion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ActivityLog_userClerkId_idx";

-- DropIndex
DROP INDEX "User_clerkUserId_key";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "userClerkId",
ADD COLUMN     "userAuthId" TEXT;

-- AlterTable
ALTER TABLE "Agrupacion" ADD COLUMN     "isVisibleInPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "InvitationCode" DROP COLUMN "forWhom",
ADD COLUMN     "agrupacion" TEXT,
ADD COLUMN     "agrupacion2" TEXT,
ADD COLUMN     "agrupacion3" TEXT,
ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isla" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "seccion" TEXT,
ADD COLUMN     "seccion2" TEXT,
ADD COLUMN     "seccion3" TEXT,
ADD COLUMN     "surname" TEXT;

-- AlterTable
ALTER TABLE "JoinRequest" ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isla" TEXT,
ADD COLUMN     "surname" TEXT;

-- AlterTable
ALTER TABLE "Papel" ADD COLUMN     "isDirector" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisibleInPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "allowedAgrupaciones" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Seccion" ADD COLUMN     "isVisibleInPublic" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "familia" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clerkUserId",
ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supabaseUserId" TEXT;

-- CreateIndex
CREATE INDEX "ActivityLog_userAuthId_idx" ON "ActivityLog"("userAuthId");

-- CreateIndex
CREATE INDEX "Event_categoryId_idx" ON "Event"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
