import prismaInstance from "@lib/connection.js";
import type { modelProducts, updateProducts } from "@modelTypes/bd.types.js";

class ProductsModel {
    getProductsDinamicly = async () => {
        return await prismaInstance.products.findMany({
            where: {
                active: true,
            },
            orderBy:{
                createdAt: "asc",
            },
        });
    };
    getProductForController = async (searchTerm : string) => {
        return await prismaInstance.products.findFirst({
            where: {
                active: true,
                bars_code: searchTerm,
            },
            select: {
                id: true,
            }
        })
    }
    createProduct = async(product: modelProducts) => {
        return await prismaInstance.products.create({
            data: product,
            select: {
                id: true,
            },
        });
    };
    updateProduct = async(id: string, product: updateProducts) => {
        return await prismaInstance.products.update({
            where: {
                id: id,
                AND: {
                    active: true,
                },
            },
            data: product,
            select: {
                id: true,
            },
        });
    };
    updateStockProduct = async (id:string, stock: number) => {
        return await prismaInstance.products.update({
            where: {
                id: id,
            },
            data: {
                current_stock: {
                    increment: stock,
                },
            },
            select: {
                id: true,
            },
        });
    }
    deleteProduct = async (id: string) => {
        return await prismaInstance.products.update({
            where: {
                id: id,
                AND: {
                    active: true,
                },
            },
            data: {
                active: false,
            },
            select: {
                id: true,
            },
        });
    };
}

export default new ProductsModel();