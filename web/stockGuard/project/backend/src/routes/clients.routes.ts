import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middlewares.js";
import { roleMiddleware } from "@/middlewares/role.middlewares.js";
import ClientsController from "@/controllers/clients.controllers.js";

class ClientsRoute {
    public router: Router;
    constructor(){
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes(): void {
        this.router.use(authMiddleware);

        this.router.get('/health', () => console.log('clients route funcionando'));
        this.router.get('/', roleMiddleware("ADMIN"), ClientsController.getClients);
        this.router.post('/create', roleMiddleware("ADMIN", "ALMACENERO"), ClientsController.createclients);
        this.router.put('/update/:id_client', roleMiddleware("ADMIN"), ClientsController.updateclients);
        this.router.delete('/delete/:id_client', roleMiddleware("ADMIN"), ClientsController.deleteClients)
    }
}

export default new ClientsRoute().router;