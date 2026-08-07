import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config"
// pool y prisma global
const poolAndPrismaGlobal = globalThis as unknown as {
    prismaGlobal: PrismaClient | undefined;
    pool: Pool | undefined;
}
// discernimiento de url segun entorno
const environment = process.env["NODE_ENV"];
const db_url = process.env["DATABASE_URL"] ?? "";
const local_db_url = process.env["LOCAL_DATABASE_URL"] ?? "";
const connection_str = environment === "dev" ? local_db_url : db_url;
// si no es undefinied entonces le pasamos la url de conexion
const poolConfig = poolAndPrismaGlobal.pool ?? new Pool({
    connectionString: connection_str,
    ssl: environment ? {rejectUnauthorized: false} : true,
});
// terminamos de configurar el adaptador
const adapter = new PrismaPg(poolConfig);
// instancia de prisma client configurada
const prismaConfig = poolAndPrismaGlobal.prismaGlobal ?? new PrismaClient({
    adapter: adapter,
    log: ['query', 'info', 'warn', 'error'],
});
// en produccion no reutilizamos conexion, en dev si
if (environment === "dev") {
    poolAndPrismaGlobal.prismaGlobal = prismaConfig;
    poolAndPrismaGlobal.pool = poolConfig;
}

export default prismaConfig;