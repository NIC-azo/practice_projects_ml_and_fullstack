import { errorHandler } from "@/middlewares/errors.middlewares.js";
import productsModel from "@/models/products.model.js";
import { ApiResponse } from "@/utils/typos.express.js";
import type { modelProducts, updateProducts } from "@modelTypes/bd.types.js";
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
        if (Object.keys(restOfBody).length <= 0 || restOfBody === undefined) {
            return ApiResponse.errorOperations(res, 
                "no se envio los datos requeridos para crear el producto");
        }
        if (String(restOfBody.bars_code)) {
            const productFound = await productsModel.getProductForController(String(restOfBody.bars_code!));
            if (productFound) {
                return ApiResponse.errorOperations(res, 
                    "ya existe un producto con el mismo codigo de barras, intentelo denuevo")
            }
        }
        const productConverted: modelProducts = {
            ...restOfBody
        }
        const productCreated = await productsModel.createProduct(productConverted);
        if (!productCreated.id || productCreated === undefined) {
            return ApiResponse.errorOperations(res, "error interno al crear el producto", 500);
        }
        return ApiResponse.operations(res, "producto creado correctamente", 201)
    });
    static updateProduct = errorHandler(async (req: Request, res: Response) => {
        const {id_product} = req.params;
        const {...restOfBody} = req.body;
        if (String(id_product) === undefined || !id_product) {
            return ApiResponse.errorOperations(res, "se necesita identificacion del producto")
        }
        if (Object.keys(restOfBody).length < 1 || restOfBody === undefined) {
            return ApiResponse.errorOperations(res, 
                "se requiere de almenos un campo para actualizar el producto")
        }
        if (String(restOfBody.bars_code)) {
            const productFound = await productsModel.getProductForController(String(restOfBody.bars_code!));
            if (productFound) {
                return ApiResponse.errorOperations(res, 
                    "ya existe un producto con el mismo codigo de barras, intentelo denuevo")
            }
        }
        const productConverted: updateProducts = {
            ...restOfBody,
        }
        const productUpdated = await productsModel.updateProduct(String(id_product!), productConverted);
        if (!productUpdated.id || productUpdated === undefined) {
            return ApiResponse.errorOperations(res, 
                "error interno al actualizar el producto", 500)
        }
        return ApiResponse.operations(res, "producto actualizado correctamente")
    });
    static deleteProduct = errorHandler(async (req: Request, res: Response) => {
        const {id_product} = req.params;
        if (String(id_product) === undefined || !id_product) {
            return ApiResponse.errorOperations(res, "se necesita identificacion del producto")
        }
        const productDeleted = await productsModel.deleteProduct(String(id_product!));
        if (productDeleted === undefined || !productDeleted.id) {
            return ApiResponse.errorOperations(res, 
                "error al eliminar el producto", 500)
        }
        return ApiResponse.operations(res, "producto eliminado correctamente")
    });
}

export default ProductsController;