/**
 * vamos a evaluar si existe aun el token o es valido y va en authorization
 * si al obtener el token (despues de separar Bearer [en este es "1"])
 * pasa el metodo verify entonces pasamos al siguiente metodo del router
 */
import "dotenv/config"
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express"
import type { JWTPayload } from "@modelTypes/typos.bd.js"
import { errorHandler } from "@middlewares/errors.middleware.js"
import { ApiResponse } from "@utils/api.response.helper.js"

export const authMiddleware = errorHandler(async(req: Request, res: Response, next: NextFunction) => {
    const headerAuth = req.headers.authorization;
    if (!headerAuth?.includes("Bearer ")){
        return ApiResponse.errorOperation(res, "se requiere del token para iniciar sesion", 401);
    }
    const tokenGotten = headerAuth.split(" ")[1]!;
    const payload = jwt.verify(
        tokenGotten,
        process.env["JWT_SECRET"] || "",
    ) as unknown as JWTPayload;
    req.user = payload;
    next();
});