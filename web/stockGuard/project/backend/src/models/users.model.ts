import prismaInstance from "@lib/connection.js";
import type { modelUser, updateUser } from "@modelTypes/bd.types.js";

class UsersModel {
    returnUsers = async () => {
        return await prismaInstance.users.findMany({
            where: {
                active: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                rol: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "asc"
            },
        });
    };
    returnUser = async (id: string) => {
        return await prismaInstance.users.findFirst({
            where: {
                active: true,
                id: id,
            },
            select: {
                name: true,
                email: true,
                rol: true,
                createdAt: true,
            },
        });
    }
    returnUserByEmail = async (email: string) => {
        return await prismaInstance.users.findFirst({
            where: {
                email: email,
                active: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                rol: true,
                password: true,
            },
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

    updateUser = async (id: string, user: updateUser) => {
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