import { router } from "@/routes/index.js";
import express from "express";
import cors from "cors"
import { corsConfig } from "@/utils/cors.configuration.js";
import "dotenv/config"

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT} (NODE_ENV: ${process.env.NODE_ENV})`);
});
