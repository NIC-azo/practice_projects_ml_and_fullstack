import type { JwtPayload } from "@modelTypes/bd.types.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}