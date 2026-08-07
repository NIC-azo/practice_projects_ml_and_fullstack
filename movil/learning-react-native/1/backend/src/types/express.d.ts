import type { JWTPayload } from "@modelTypes/typos.bd.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}