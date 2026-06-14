import prismaInstance from "@lib/connection.js";

class SellsModel {
    getSellsDinamicly = async (id?: string) => {
        return await prismaInstance.sells.findMany({
            ...(id && {
                where: {
                    id: id,
                },
            }),
            select: {
                client: {
                    select: {name: true, }
                },
                user: {
                    select : {name: true,}
                },
                details: {
                    select: {
                        product: {
                            select: {
                                name: true,
                                bars_code: true,
                            },
                        },
                    },
                },
                voucher: true,
                status: true,
            },
            orderBy: {
                createdAt: "asc"
            },
        });
    };
}

export default new SellsModel();