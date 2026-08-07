import TodoController from "@/controllers/todo.controller.js";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

class TodoRoutes {
    public router: Router;
    
    constructor(){
        this.router = Router();
        this.routesConfigurated();
    }
    private routesConfigurated(): void {
        this.router.use(authMiddleware);
        this.router.get('/health', () => console.log("todo routes funcionando correctamente"));
        this.router.get('/', TodoController.getAll);
        this.router.post('/create', TodoController.createTodo);
        this.router.put('/update/:todoId', TodoController.updateTodo);
        this.router.delete('/delete/:todoId', TodoController.deleteTodo);
    }
}

export default new TodoRoutes().router;