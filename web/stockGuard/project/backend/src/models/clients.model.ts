import prismaInstance from "@lib/connection.js";
import type { modelClients } from "@modelTypes/bd.types.js";

class ClientsModel {
    getClientsDinamicly = async (searchTerm?: string) => {
        return await prismaInstance.clients.findMany({
            where: {
                active: true,
                ...(searchTerm && {
                    OR: [
                        {name: {contains: searchTerm, mode: "insensitive"}},
                        {email: {contains: searchTerm, mode: "insensitive"}},
                        {dni: {contains: searchTerm, mode: "insensitive"}},
                        {ruc: {contains: searchTerm, mode: "insensitive"}},
                        {cellPhone: {contains: searchTerm, mode: "insensitive"}},
                    ],
                }),
            },
            orderBy: {
                createdAt: "asc",
            }
        });
    };
    createClients = async (clients: modelClients) => {
        return await prismaInstance.clients.create({
            data: clients,
            select: {
                id: true,
            },
        });
    };
    updateClients = async (id: string, clients: modelClients) => {
        return await prismaInstance.clients.update({
            where: {
                id: id,
                AND: {
                    active: true,
                },
            },
            data: clients,
            select: {
                id: true,
            },
        });
    };
    deleteClients = async (id: string) => {
        return await prismaInstance.clients.update({
            where: {
                id: id,
                AND:{
                    active: true,
                }
            },
            data: {
                active: false,
            },
        });
    };
}

export default new ClientsModel();