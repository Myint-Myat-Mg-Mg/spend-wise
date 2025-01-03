/*
  Warnings:

  - You are about to drop the column `Notification` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `Percentage` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `notification` to the `Budget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "Notification";
ALTER TABLE "Budget" DROP COLUMN "Percentage";
ALTER TABLE "Budget" ADD COLUMN     "notification" BOOL NOT NULL;
ALTER TABLE "Budget" ADD COLUMN     "percentage" INT4;
ALTER TABLE "Budget" ADD COLUMN     "userId" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
