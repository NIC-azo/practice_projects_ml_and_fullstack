import HistoryController from "@/controllers/history.controllers.js";
import { authMiddleware } from "@/middlewares/auth.middlewares.js";
import { roleMiddleware } from "@/middlewares/role.middlewares.js";
import { Router } from "express";

class HistoryRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes(): void {
        this.router.use(authMiddleware);
        this.router.get('/health', () => console.log('history route funcionando'));
        this.router.get('/', roleMiddleware("ADMIN"), HistoryController.getHistory);
    }
}

export default new HistoryRoutes().router;