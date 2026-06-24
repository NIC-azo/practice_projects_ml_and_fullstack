import { authMiddleware } from "@/middlewares/auth.middlewares.js";
import { roleMiddleware } from "@/middlewares/role.middlewares.js";
import { Router } from "express";
import DashboardController from "@/controllers/dashboard.controllers.js";

class DashboardRoute {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configRoutes();
    }

    private configRoutes() : void {
        this.router.use(authMiddleware);

        this.router.get('/health', () => console.log(`dashboard routes funcionando`))
        this.router.get('/alerts', roleMiddleware("ADMIN", "ALMACENERO"), DashboardController.productsAlert);
        this.router.get('/reportsData', roleMiddleware("ADMIN"), DashboardController.adminDataReports);
    }
}

export default new DashboardRoute().router;