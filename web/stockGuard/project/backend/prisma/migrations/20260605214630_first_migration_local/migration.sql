-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ALMACENERO');

-- CreateEnum
CREATE TYPE "TypeVoucher" AS ENUM ('BOLETA', 'FACTURA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CANCELADO', 'EN_PROCESO', 'ANULADO');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ALMACENERO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bars_code" TEXT NOT NULL,
    "lote" TEXT,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "unity_price" DECIMAL(10,2) NOT NULL,
    "wholesale_price" DECIMAL(10,2) NOT NULL,
    "current_stock" INTEGER NOT NULL DEFAULT 5,
    "minimun_stock" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "dni" TEXT,
    "ruc" TEXT,
    "cellPhone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sells" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "voucher" "TypeVoucher" NOT NULL DEFAULT 'BOLETA',
    "status" "Status" NOT NULL DEFAULT 'EN_PROCESO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellDetails" (
    "id" TEXT NOT NULL,
    "sellId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "actual_price" DECIMAL(10,2) NOT NULL,
    "subTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Products_bars_code_key" ON "Products"("bars_code");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_email_key" ON "Clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_dni_key" ON "Clients"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_cellPhone_key" ON "Clients"("cellPhone");

-- AddForeignKey
ALTER TABLE "Sells" ADD CONSTRAINT "Sells_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sells" ADD CONSTRAINT "Sells_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellDetails" ADD CONSTRAINT "SellDetails_sellId_fkey" FOREIGN KEY ("sellId") REFERENCES "Sells"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellDetails" ADD CONSTRAINT "SellDetails_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
