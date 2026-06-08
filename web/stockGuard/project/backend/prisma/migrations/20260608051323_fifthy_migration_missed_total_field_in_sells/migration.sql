/*
  Warnings:

  - Added the required column `total` to the `Sells` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sells" ADD COLUMN     "total" DECIMAL(10,2) NOT NULL;
