import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import type { JwtPayload } from "@modelTypes/bd.types.js"
import { errorHandler } from "@middlewares/errors.middlewares.js"
import { ApiResponse } from "@utils/typos.express.js"
import "dotenv/config"

export const authMiddleware = errorHandler(async(req: Request, res: Response, next: NextFunction) => {
    const headerAuth = req.headers.authorization;
    if (!headerAuth?.includes("Bearer: ")){
        return ApiResponse.errorOperations(res, "se requiere del token para iniciar sesion", 401);
    }
    const tokenGotten = headerAuth.split(" ")[1]!;
    const payload = jwt.verify(
        tokenGotten,
        process.env["SESSION_SECRET"] || "",
    ) as unknown as JwtPayload;
    req.user = payload;
    next();
});