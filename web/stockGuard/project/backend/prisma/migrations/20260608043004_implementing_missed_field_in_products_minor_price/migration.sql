/*
  Warnings:

  - Added the required column `minorsale_price` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "minorsale_price" DECIMAL(10,2) NOT NULL;
