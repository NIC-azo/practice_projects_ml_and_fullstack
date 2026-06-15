import prismaInstance from "@lib/connection.js";

class HistoryModel {
    getUserSells = async () => {
        return await prismaInstance.sells.findMany({
            where: {
                status: {
                    not: "ANULADO",
                },
            },
            select: {
                client: {
                    select: {
                        name: true,
                        dni: true,
                    },
                },
                status: true,
                voucher: true,
                user: {
                    select: {
                        name: true,
                        rol: true,
                    },
                },
                details: {
                    select: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                        quantity: true,
                        actual_price: true,
                    },
                },
                total: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }
}

export default new HistoryModel();