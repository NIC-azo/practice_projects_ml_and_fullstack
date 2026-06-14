import usersModel from "@/models/users.model.js";
import bcrypt from "bcrypt"
import { errorHandler } from "@/middlewares/errors.middlewares.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@/utils/typos.express.js";
import type { modelUser, updateUser } from "@modelTypes/bd.types.js";

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
            
            if (userLocated?.email === String(restOfBody.email!)){
                return ApiResponse.errorOperations(res, 
                    "ya existe un usuario con el mismo email ingresado");
            }
        }
        const passwordHashed = await bcrypt.hash(restOfBody.password!, Number(process.env["HASH_SALTS"]!));
        const userConverted: modelUser = {
            ...restOfBody,
            ...({
                password: passwordHashed,
            }),
        };
        const userCreated = await usersModel.createUser(userConverted);
        if (userCreated === undefined || !userConverted) {
            return ApiResponse.errorOperations(res, "error interno al crear al usuario", 500);
        }
        return ApiResponse.operations(res, "usuario creado correctamente", 201);
    });
    static updateUser = errorHandler(async (req: Request, res: Response) => {
        const {id_user} = req.params;
        const {...restOfBody} = req.body;
        if (Object.keys(restOfBody).length <= 0 || String(restOfBody.name!) === undefined) {
            return ApiResponse.errorOperations(res, "se requiere por lo menos 1 campo a actualizar")
        }
        if (String(id_user!) === undefined){
            return ApiResponse.errorOperations(res, "se requiere identificacion del usuario");
        }
        if (String(restOfBody.email!)) {
            const userFound = await usersModel.returnUserByEmail(String(restOfBody.email!));
            if (userFound?.email === String(restOfBody.email!) && userFound.id !== String(id_user!)){
                return ApiResponse.errorOperations(res, "ya existe un usuario con el mismo email ingresado")
            }
        }
        const userConverted: updateUser = {
            ...restOfBody,
            ...(
                restOfBody.password && {
                    password: await bcrypt.hash(String(restOfBody.password!), Number(process.env["HASH_SALTS"]!))
                }
            ),
        };
        const userUpdated = await usersModel.updateUser(String(id_user!), userConverted);
        if (userUpdated === undefined || !userUpdated.id) {
            return ApiResponse.errorOperations(res, "error al actualizar al usuario", 500);
        }
        return ApiResponse.operations(res, "usuario actualizado correctamente");
    });
    static deleteUser = errorHandler(async (req: Request, res: Response) => {
        const {id_user} = req.params;
        if (String(id_user!) === undefined){
            return ApiResponse.errorOperations(res, "se requiere identificacion del usuario");
        }
        const userDeleted = await usersModel.deleteUser(String(id_user!));
        if (userDeleted === undefined) {
            return ApiResponse.errorOperations(res, "error interno al eliminar usuario")
        }
        return ApiResponse.operations(res, "usuario eliminado correctamente")
    });
}

export default UsersController;