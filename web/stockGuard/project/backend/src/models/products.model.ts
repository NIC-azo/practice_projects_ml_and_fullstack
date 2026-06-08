import prismaInstance from "@lib/connection.js";
import type { modelProducts } from "@modelTypes/bd.types.js";

class ProductsModel {
    getProductsDinamicly = async (searchTerm? : string) => {
        return await prismaInstance.products.findMany({
            where: {
                active: true,
                ...(searchTerm && {
                    OR: [
                        {name: {contains: searchTerm, mode: "insensitive"}},
                        {bars_code: {contains: searchTerm, mode: "insensitive"}},
                    ],
                }),
            },
            orderBy:{
                createdAt: "asc",
            },
        });
    };
    createProduct = async(product: modelProducts) => {
        return await prismaInstance.products.create({
            data: product,
            select: {
                id: true,
            },
        });
    };
    updateProduct = async(id: string, product: modelProducts) => {
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