import dashboardModel from "@/models/dashboard.model.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@/utils/typos.express.js";
import { errorHandler } from "@/middlewares/errors.middlewares.js";

class DashboardController {
    static productsAlert = errorHandler(async (req: Request, res: Response) => {
        const results = await dashboardModel.alertStock();
        if (results === undefined) {
            return ApiResponse.errorOperations(res, "error interno al obtener alertas de stock", 500)
        }
        return ApiResponse.returnResults(res, results)
    });

    static adminDataReports = errorHandler(async (req: Request, res: Response) => {
        const [totalInventoryValue, sellsToday, usersTotal] = await Promise.all([
            dashboardModel.totalInventoryValue(),
            dashboardModel.sellsToday(),
            dashboardModel.usersTotal(),
        ]);

        if (totalInventoryValue === undefined) {
            return ApiResponse.errorOperations(res, "error interno al obtener el total del inventario"
                , 500
            )
        }
        if (sellsToday === undefined) {
            return ApiResponse.errorOperations(res, "error interno al obtener las ventas de hoy",
                500
            )
        }

        if (usersTotal === undefined) {
            return ApiResponse.errorOperations(res, "error interno al obtener el total de usuarios",
                500
            )
        }

        const results = {
            totalInventoryValue,
            sellsToday,
            usersTotal,
        };
        
        return ApiResponse.returnResults(res, results);
    });
}

export default DashboardController;