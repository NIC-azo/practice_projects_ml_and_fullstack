import { Router } from "express";
import authRoutes from "@routes/auth.routes.js";
import usersRoutes from "@routes/users.routes.js";

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

export {router};