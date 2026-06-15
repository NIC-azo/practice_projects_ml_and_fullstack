import historyModel from "@/models/history.model.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@/utils/typos.express.js";
import { errorHandler } from "@/middlewares/errors.middlewares.js";

class HistoryController {
    static getHistory = errorHandler(async (req: Request, res: Response) => {
        const results = await historyModel.getUserSells();
        if (results === undefined) {
            return ApiResponse.errorOperations(res, 
                "error interno al obtener historial", 500)
        }
        return ApiResponse.returnResults(res, results)
    });
}

export default HistoryController;