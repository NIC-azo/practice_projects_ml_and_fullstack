/*
  Warnings:

  - Added the required column `limit_minor_adquirition` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "limit_minor_adquirition" DECIMAL(10,2) NOT NULL;
