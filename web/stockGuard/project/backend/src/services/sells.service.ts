import prismaInstance from "@lib/connection.js";
import type { InitSell, Status } from "@modelTypes/bd.types.js";
import jwt from "jsonwebtoken"
class SellsService {

    initSell = async (userId: string, request: InitSell) => {
        const {clientId, typeVoucher, itemsSelected} = request;
        let errors: string[] = [];
        const productsId = itemsSelected.map((p) => p.productId);
        const productsFromDB = await prismaInstance.products.findMany({
            where: {
                id: {
                    in: productsId,
                },
                active: true,
            },
        });
        if (productsFromDB.length <= 0 || productsFromDB === undefined) {
            errors.push("hubo un error al obtener los productos de la bd");
        }
        if (productsFromDB.length < itemsSelected.length) {
            errors.push("hay productos solicitados no existentes o no habidos");
        }
        let total = 0;
        const buildSellDetails = itemsSelected.map((p) => {
            const product = productsFromDB.find((i) => i.id === p.productId);
            if (!product) {
                errors.push(`no se encontro este producto: ${product!.name}`);
                return null;
            }
            if (product?.current_stock < p.quantity){
                errors.push("los productos solicitados sobrepasan los productos en stock");
                return null;
            }
            const minor_of_sale = p.quantity >= product.limit_minor_adquirition
                ? product.wholesale_price : product.minorsale_price;
            const subTotalCalculation = Number(minor_of_sale) * p.quantity;
            total += subTotalCalculation;
            return {
                actual_price: product.unity_price,
                quantity: p.quantity,
                subTotal: subTotalCalculation,
                product: p.productId,
            }
        });
        if (errors.length > 0) {
            return { success: false, errors };
        }
        const creatingDetails = prismaInstance.$transaction(async (tx) => {
            const newSale = await tx.sells.create({
                data: {
                    userId: userId,
                    clientId: clientId,
                    voucher: typeVoucher,
                    total: total,
                    details: {
                        create: buildSellDetails.map((bsd) => ({
                            actual_price: bsd?.actual_price!,
                            quantity: bsd?.quantity!,
                            subTotal: bsd?.subTotal!,
                            product: {connect: {id: bsd?.product!}}
                        }))
                    },
                },
                include: {
                    details: true,
                },
            });

            for (const  items of itemsSelected) {
                await tx.products.update({
                    where: {
                        id: items.productId,
                    },
                    data: {
                        current_stock: {
                            decrement: items.quantity,
                        },
                    },

                });
            };
            return newSale;
        });
        return {data: creatingDetails}
    };

    updateSellStatus = async (idSell: string, status: Status) => {
        let errors: string[] = [];
        const sellAndDetailsFound = await prismaInstance.sells.findFirst({
            where: {
                id: idSell,
            },
            include: {
                details: true,
            }
        });
        if (sellAndDetailsFound === undefined || !sellAndDetailsFound) {
            errors.push("no se encontro la venta, consulte con soporte tecnico");
        }
        if (sellAndDetailsFound?.status === "ANULADO") {
            errors.push("la venta se encuentra anulada");
        }
        if (errors.length > 0) {
            return {success: false, errors}
        }
        const proccedOperations = await prismaInstance.$transaction(async (tx) => {
            if (status === "ANULADO") {
                for (const detail of sellAndDetailsFound!.details) {
                    await tx.products.update({
                        where: {
                            id: detail.productId,
                        },
                        data: {
                            current_stock: {
                                increment: detail.quantity,
                            }
                        },
                    });
                };
            };
            return await tx.sells.update({
                where: {
                    id: idSell,
                },
                data: {
                    status: status,
                },
            });
        });
        return {success: true, data: proccedOperations};
    };
}