import type { Rol } from "@modelTypes/bd.types.js";
import type { Request, Response, NextFunction } from "express"
import { ApiResponse } from "@/utils/typos.express.js";
import prismaInstance from "@/lib/connection.js";

export const roleMiddleware = (...rolesAllowed: Rol[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {userId} = req.user!;
        
        if (userId === undefined || !userId) {
            return ApiResponse.errorOperations(res, 
                "identificacion del usuario no encontrado", 401)
        }

        const userFound = await prismaInstance.users.findUnique({
            where: {
                active: true,
                id: userId,
            },
            select: {
                rol: true,
            },
        });

        if (userFound === undefined || !userFound) {
            return ApiResponse.errorOperations(res, 
                "el usuario no ha sido encontrado o no existe", 401)
        }

        if (!userFound.rol || !rolesAllowed.includes(userFound.rol)){
            return ApiResponse.errorOperations(res, 
                "Usuario no permitido para realizar esta operacion", 403);
        };


        req.user!.rol = userFound.rol;

        next();
    };
};