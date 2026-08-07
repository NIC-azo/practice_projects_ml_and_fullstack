import todoRoute from "@routes/todo.route.js";
import userRoute from "@routes/user.route.js";
import profileRoute from "@routes/user.route.js";
import { Router } from "express";

const router: Router = Router();

router.use('/auth', userRoute);
router.use('/todos', todoRoute);
router.use('/profile', profileRoute);

export {router};