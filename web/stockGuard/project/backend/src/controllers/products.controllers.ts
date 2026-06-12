import { errorHandler } from "@/middlewares/errors.middlewares.js";
import productsModel from "@/models/products.model.js";
import { ApiResponse } from "@/utils/typos.express.js";
import type { modelProducts } from "@modelTypes/bd.types.js";
import type { Request, Response } from "express";

class ProductsController {
    static getProducts = errorHandler(async (req: Request, res: Response) => {
        const results = await productsModel.getProductsDinamicly();
        if (results === undefined || !results) {
            return ApiResponse.errorOperations(res, "error interno al obtener productos", 500)
        }
        return ApiResponse.returnResults(res, results);
    });
    static createProduct = errorHandler(async(req: Request, res: Response) => {
        const {...restOfBody} = req.body;
    })
}