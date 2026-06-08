import type { JwtPayloadStockGuard } from "@modelTypes/express.d.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayloadStockGuard;
        }
    }
}