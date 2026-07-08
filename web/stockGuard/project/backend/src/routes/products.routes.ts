import { Router } from "express";
import ProductsController from "@/controllers/products.controllers.js";
import { roleMiddleware } from "@/middlewares/role.middlewares.js";
import { authMiddleware } from "@/middlewares/auth.middlewares.js";

class ProductRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes(): void {
        this.router.use(authMiddleware)

        this.router.get('/health', () => console.log('products route funcionando'));
        this.router.get('/', roleMiddleware("ADMIN", "ALMACENERO"), ProductsController.getProducts);
        this.router.post('/create', roleMiddleware("ADMIN"), ProductsController.createProduct);
        this.router.put('/update/:id_product', roleMiddleware("ADMIN"), ProductsController.updateProduct);
        this.router.put('/updateStock/:id_product', roleMiddleware("ADMIN", "ALMACENERO"), ProductsController.updateStockProduct);
        this.router.delete('/delete/:id_product', roleMiddleware("ADMIN"), ProductsController.deleteProduct);
    }
}

export default new ProductRoutes().router;