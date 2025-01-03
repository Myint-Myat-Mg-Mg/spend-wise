-- CreateTable
CREATE TABLE "Budget" (
    "id" STRING NOT NULL,
    "amount" INT4 NOT NULL,
    "categoryId" STRING NOT NULL,
    "Notification" BOOL NOT NULL,
    "Percentage" INT4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
