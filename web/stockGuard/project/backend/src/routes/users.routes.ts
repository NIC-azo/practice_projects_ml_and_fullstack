import UsersController from "@/controllers/users.controllers.js";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middlewares.js";
import { roleMiddleware } from "@/middlewares/role.middlewares.js";

class UserRoutes {
    public router: Router;

    constructor(){
        this.router = Router();
        this.configRoutes();
    }

    private configRoutes(): void {
        this.router.use(authMiddleware);

        this.router.get('/health', roleMiddleware("ADMIN"), () => console.log("user routes funcionando"));
        this.router.get('/', roleMiddleware("ADMIN"), UsersController.getUsers);
        this.router.post('/create', roleMiddleware("ADMIN"), UsersController.createUser);
        this.router.put('/update/:id_user', roleMiddleware("ADMIN"), UsersController.updateUser);
        this.router.delete('/delete/:id_user', roleMiddleware("ADMIN"), UsersController.deleteUser);
    }
}

export default new UserRoutes().router;