/*
  Warnings:

  - You are about to alter the column `limit_minor_adquirition` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "limit_minor_adquirition" SET DEFAULT 5,
ALTER COLUMN "limit_minor_adquirition" SET DATA TYPE INTEGER;
