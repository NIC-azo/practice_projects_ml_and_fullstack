import { Router } from "express";
import authRoutes from "@routes/auth.routes.js";
import usersRoutes from "@routes/users.routes.js";
import productsRoutes from "@routes/products.routes.js";
import clientsRoutes from "@routes/clients.routes.js";
import sellsRoutes from "@routes/sells.routes.js";
import historyRoutes from "@routes/history.routes.js";

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/clients', clientsRoutes);
router.use('/sells', sellsRoutes);
router.use('/history', historyRoutes);

export {router};