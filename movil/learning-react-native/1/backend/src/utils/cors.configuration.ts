import type { CorsOptions } from "cors";
import "dotenv/config"

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env["ALLOWED_ORIGINS"]!.split(",") || [];

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("not allowed by cors"));
        }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}
