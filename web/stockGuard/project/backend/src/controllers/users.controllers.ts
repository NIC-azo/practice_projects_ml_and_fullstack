import usersModel from "@/models/users.model.js";
import bcrypt from "bcrypt"
import { errorHandler } from "@/middlewares/errors.middlewares.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@/utils/typos.express.js";
import type { modelUser } from "@modelTypes/bd.types.js";

class UsersController {
    static getUsers = errorHandler(async (req: Request, res: Response) => {
        const results = await usersModel.returnUsers();
        if (results === undefined || !results) {
            return ApiResponse.errorOperations(res, "error interno al obtener los usuarios", 500);
        }
        return ApiResponse.returnResults(res, results);
    });
    static createUser = errorHandler(async (req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        if (Object.keys(restOfBody).length <= 0 || String(restOfBody.name!) === undefined) {
            return ApiResponse.errorOperations(res, 
                "se necesita por lo menos el nombre del usuario para proceder");
        }
        if (String(restOfBody.email!)){
            const userLocated = await usersModel.returnUserByEmail(String(restOfBody.email!));
            
        }
    });
}