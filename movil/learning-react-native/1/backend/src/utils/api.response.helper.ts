import type { Response } from "express";

export class ApiResponse {
    static auth(res: Response, token: string, message: string, userId: string, status = 200) {
        return res.status(status).json({token, message, userId});
    };
    static returnResult<T>(res: Response, data: T, status = 200) {
        return res.status(status).json(data);
    };
    static errorOperation(res: Response, message: string, status = 400) {
        return res.status(status).json({error: true, message});
    };
    static operation(res: Response, message: string, status = 200) {
        return res.status(status).json({message});
    };
}