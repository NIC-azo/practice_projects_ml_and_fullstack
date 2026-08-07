import UsersController from "@/controllers/user.controller.js";
import { Router } from "express";

class UsersRoute {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routesConfigurated();
    }
    private routesConfigurated(): void {
        this.router.get('/health', () => console.log("users route funcionando correctamente"));
        this.router.post('/login', UsersController.login);
        this.router.post('/register', UsersController.register);
    }
}

export default new UsersRoute().router;