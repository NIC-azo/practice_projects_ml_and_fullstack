import sellsService from "@/services/sells.service.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@/utils/typos.express.js";
import { errorHandler } from "@/middlewares/errors.middlewares.js";
import type { InitSell, Status } from "@/types/bd.types.js";

class SellsController {
    static initSell = errorHandler(async (req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        const {userId} = req.user!;
        if (userId === undefined || !userId) {
            return ApiResponse.errorOperations(res, 
                "se necesita identificacion del usuario")
        }
        if (Object.keys(restOfBody).length === 0 || !restOfBody.itemsSelected) {
            return ApiResponse.errorOperations(res, 
                "los campos enviados no son suficientes para procesar venta")
        }
        const initSellConverted: InitSell = {
            ...restOfBody,
        }
        const sellInitiated = await sellsService.initSell(userId, initSellConverted);
        if (sellInitiated === undefined || !sellInitiated){
            return ApiResponse.errorOperations(res, 
                "error interno al iniciar venta", 500)
        }
        if (!sellInitiated.success) {
            return ApiResponse.errorOperations(res, sellInitiated.errors?.join(' | ') || "");
        }
        return ApiResponse.operations(res, "venta iniciada correctamente", 201)
    });
    static updateState = errorHandler(async (req: Request, res: Response) => {
        const {id_sell} = req.params;
        const {status} = req.body;

        if (String(id_sell!) === undefined || !String(id_sell!)) {
            return ApiResponse.errorOperations(res, 
                "se requiere identificacion de la venta para proceder")
        }
        const validStatus:Status[] = ["ANULADO", "CANCELADO", "EN_PROCESO"];
        if (!validStatus.includes(status)) {
            return ApiResponse.errorOperations(res, 
                "el status enviado no es valido")
        }
        const statusConverted = status as Status;
        const sellUpdated = await sellsService.updateSellStatus(String(id_sell), statusConverted);
        if (!sellUpdated.success) {
            return ApiResponse.errorOperations(res, sellUpdated.errors?.join(' | ') || "")
        }
        if (sellUpdated === undefined || !sellUpdated) {
            return ApiResponse.errorOperations(res, "error interno al actualizar status de venta", 500)
        }
        return ApiResponse.operations(res, "status actualizado correctamente")
    })
}

export default SellsController;