import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv"

const prismaGlobal = globalThis as unknown as {
    prismaGlobal: PrismaClient | undefined;
    pool: Pool | undefined;
}

const environment = process.env.NODE_ENV === "dev";
const db_url = process.env.DATABASE_URL || "";
const local_db_url = process.env.LOCAL_DATABASE_URL || "";
const connectionstr = environment ? local_db_url : db_url;

const poolConfig = prismaGlobal.pool ?? new Pool({
    connectionString: connectionstr,
    ssl: environment ? {rejectUnauthorized: false} : true
});

const adapter = new PrismaPg(poolConfig);

const prismaInstance = prismaGlobal.prismaGlobal ?? new PrismaClient({
    adapter: adapter,
    log: ['query', 'info', 'warn', 'error'],
});

if (environment){
    prismaGlobal.prismaGlobal = prismaInstance;
    prismaGlobal.pool = poolConfig;
}

export default prismaInstance;