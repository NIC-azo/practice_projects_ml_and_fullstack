import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middlewares.js";
import {roleMiddleware} from '@/middlewares/role.middlewares.js'
import SellsController from "@/controllers/sells.controllers.js";

class SellsRoute {
    public router: Router;
    constructor() {
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes(): void {
        this.router.use(authMiddleware)

        this.router.get('/health', () => console.log('sell routes funcionando'));
        this.router.post('/create', roleMiddleware("ADMIN", "ALMACENERO"), SellsController.initSell);
        this.router.put('/update/:id_sell', roleMiddleware("ADMIN", "ALMACENERO"), SellsController.updateState);
    }
}

export default new SellsRoute().router;