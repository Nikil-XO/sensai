/*
  Warnings:

  - You are about to drop the column `answer` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `userAnswer` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `User` table. All the data in the column will be lost.
  - Added the required column `quizScore` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `CoverLetter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `CoverLetter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_industry_fkey";

-- DropIndex
DROP INDEX "CoverLetter_userId_key";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "answer",
DROP COLUMN "question",
DROP COLUMN "score",
DROP COLUMN "userAnswer",
ADD COLUMN     "improvementTip" TEXT,
ADD COLUMN     "questions" JSONB[],
ADD COLUMN     "quizScore" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "CoverLetter" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "title",
ADD COLUMN     "industryId" TEXT,
ALTER COLUMN "industry" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CoverLetter_userId_idx" ON "CoverLetter"("userId");

-- CreateIndex
CREATE INDEX "User_industryId_idx" ON "User"("industryId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "IndustryInsight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
