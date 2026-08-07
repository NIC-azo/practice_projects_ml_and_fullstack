import UsersController from "@/controllers/user.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { Router } from "express";

class ProfileRoute {
    public router: Router;

    constructor(){
        this.router = Router();
        this.routesConfigurated();
    }
    private routesConfigurated(): void {
        this.router.use(authMiddleware)
        this.router.get('/health', () => console.log("profile route funcionando correctamente"));
        this.router.put('/update', UsersController.updateUser);
        this.router.delete('/delete', UsersController.deleteUser);
        this.router.get('/profile', UsersController.profileUser);
    }
}
export default new ProfileRoute().router;