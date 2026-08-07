import prismaConfig from "@/lib/prisma.lib.js";
import type { UserManagement, UserUpdate } from "@modelTypes/typos.bd.js";

class UsersModel {
    getUserById = async (id: string) => {
        return await prismaConfig.user.findUnique({
            where: {
                id: id,
                active: true,
            },
            select: {
                id: true,
                userName: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }
    getUserByemail = async (email: string) => {
        return await prismaConfig.user.findUnique({
            where: {
                email: email,
                active: true,
            },
            select: {
                id: true,
                passwordHashed: true,
            }
        });
    }
    getUserByNickName = async (name: string) => {
        return await prismaConfig.user.findFirst({
            where: {
                userName: name,
                active: true,
            },
            select: {
                id: true,
            }
        });
    }
    registerUser = async (user: UserManagement) => {
        return await prismaConfig.user.create({
            data: user,
            select: {
               id: true, 
            },
        });
    }
    updateUser = async (id: string, user: UserUpdate) => {
        return await prismaConfig.user.update({
            where: {
                id: id,
            },
            data: user,
            select: {
                id: true,
            }
        })
    }
    deleteUser = async (id: string) => {
        return await prismaConfig.user.update({
            where: {
                id: id,
            },
            data: {
                active: false,
            },
            select: {
                id: true,
            },
        });
    }
}

export default new UsersModel();