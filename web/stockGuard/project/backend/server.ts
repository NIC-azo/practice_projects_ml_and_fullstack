import express from "express"
import cors from "cors"
import { router } from "@/routes/index.routes.js";
import "dotenv/config"

const environment = process.env["NODE_ENV"] || "";

const app = express();

app.use(cors({
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
    origin: process.env["FRONTEND_LOCAL"] || ""
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true,
}));

app.use('/api', router);

const DISCERN_PORT = environment === "dev" 
    ? process.env["LOCAL_PORT"] || "" 
    : process.env["PORT"] || "";

app.listen(DISCERN_PORT, () => {
    console.log(`servidor funcionando en puerto: `, DISCERN_PORT);
});