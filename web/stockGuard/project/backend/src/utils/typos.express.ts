import type { AuthResponse } from "@modelTypes/bd.types.js";
import type { Response } from "express";

export class ApiResponse {
    static auth(res: Response, token: string, message: string, user: AuthResponse, status = 200) {
        return res.status(status).json({token, message, user});
    };
    static returnResults<T>(res: Response, data: T, status = 200) {
        return res.status(status).json({data})
    };
    static operations(res: Response, message: string, status = 200) {
        return res.status(status).json({message})
    };
    static errorOperations(res: Response, message: string, status = 400) {
        return res.status(status).json({error: true, message})
    };
}
