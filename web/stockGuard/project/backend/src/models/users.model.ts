import prismaInstance from "@lib/connection.js";
import type { modelUser } from "@modelTypes/bd.types.js";

class UsersModel {
    getUsersDynamicly = async (searchTerm?: string) => {
        return await prismaInstance.users.findMany({
            where: {
                active: true,
                ...(searchTerm && {
                    OR: [
                        {email: {contains: searchTerm, mode: "insensitive"}},
                    ],
                }),
            },
            select:{
                id: true,
                name: true,
                email: true,
                password: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "asc",
            }
        });
    };

    createUser = async (user: modelUser) => {
        return await prismaInstance.users.create({
            data: user,
            select: {
                id: true,
            },
        });
    };

    updateUser = async (id: string, user: modelUser) => {
        return await prismaInstance.users.update({
            where: {
                id: id,
                AND: {
                    active: true,
                },
            },
            data: user,
        });
    };

    deleteUser = async (id: string) => {
        return await prismaInstance.users.update({
            where: {
                id: id,
            },
            data: {
                active: false,
            },
        });
    };
}

export default new UsersModel();