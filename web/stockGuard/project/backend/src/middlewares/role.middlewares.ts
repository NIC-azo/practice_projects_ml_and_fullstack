import type { Rol } from "@modelTypes/bd.types.js";
import type { Request, Response, NextFunction } from "express"
import { ApiResponse } from "@/utils/typos.express.js";

export const roleMiddleware = (...rolesAllowed: Rol[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRol = req.user?.rol;
        if (!userRol || !rolesAllowed.includes(userRol)){
            return ApiResponse.errorOperations(res, 
                "Usuario no authorizado para realizar esta operacion", 401);
        }
        next();
    };
};