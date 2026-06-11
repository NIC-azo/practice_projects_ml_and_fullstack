import { Router } from "express";
import AuthController from "@/controllers/auth.controllers.js";

class AuthRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configMethods();
    }

    private configMethods(): void {


        this.router.get('/health', () => console.log(`auth router funcionando`));
        this.router.post('/login', AuthController.login);
    }
}

export default new AuthRoutes().router;