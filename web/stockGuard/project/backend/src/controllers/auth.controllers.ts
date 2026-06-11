import usersModel from "@/models/users.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { errorHandler } from "@/middlewares/errors.middlewares.js";
import { ApiResponse } from "@/utils/typos.express.js";
import type { Request, Response } from "express";
import "dotenv/config"

class AuthController {
    static login = errorHandler(async (req: Request, res: Response) => {
        const {email, password} = req.body;
        if (String(password).length < 6 || String(password) === undefined) {
            return ApiResponse.errorOperations(res, "credenciales incorrectas");
        }
        if (String(email).length < 0 || !String(email).includes("@")) {
            return ApiResponse.errorOperations(res, "credenciales incorrectas");
        }
        const usersGotten = await usersModel.returnUserByEmail(String(email!));
        if (usersGotten === undefined || !usersGotten) {
            return ApiResponse.errorOperations(res, "error al procesar login", 500);
        }
        const userFound = await bcrypt.compare(String(password!), usersGotten.password);
        if (!userFound) {
            return ApiResponse.errorOperations(res, "credenciales incorrectas");
        }
        const genToken = jwt.sign(
            {userId: usersGotten.id, rol: usersGotten.rol},
            process.env["SESSION_SECRET"] || "",
            {expiresIn: '24h'}
        );
        return ApiResponse.auth(res, genToken, "autenticado correctamente, dirigiendo ",
            {user: {userId: usersGotten.id, rol: usersGotten.rol}}
        )
    });
}

export default AuthController;