import prismaInstance from "@/lib/connection.js";
import { Prisma } from "@prisma/client";

class DashboardModel {
    alertStock = async () => {
        return await prismaInstance.products.findMany({
            where: {
                AND: [
                    {active: true,},
                    {current_stock: {lte: prismaInstance.products.fields.minimun_stock}},
                ],
            },
            select: {
                name: true,
                current_stock: true,
                minimun_stock: true,
                bars_code: true,
            },
        });
    };

    totalProducts = async () => {
        return await prismaInstance.products.count({
            where: {
                active: true,
            },
        });
    };

    totalInventoryValue = async () => {
        const results = await prismaInstance.products.findMany({
            where: {
                active: true,
            },
            select: {
                current_stock: true,
                unity_price: true,
            },
        });

        const resultTotal = results.reduce((prev, curr) => {
            const total = new Prisma.Decimal(curr.current_stock).mul(curr.unity_price);
            return prev.add(total);
        }, new Prisma.Decimal(0));

        return resultTotal.toNumber();
    };

    sellsToday = async () => {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const results = await prismaInstance.sells.count({
            where: {
                status: "CANCELADO",
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        return results;
    };

    usersTotal = async () => {
        return await prismaInstance.users.count({
            where: {
                active: true,
            },
        });
    };
}

export default new DashboardModel;