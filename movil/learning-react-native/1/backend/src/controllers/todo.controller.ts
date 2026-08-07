import { errorHandler } from "@/middlewares/errors.middleware.js";
import todoModel from "@/models/todo.model.js";
import { ApiResponse } from "@/utils/api.response.helper.js";
import type { TodoManagement } from "@modelTypes/typos.bd.js"
import type { Request, Response } from "express";

class TodoController {
    /**
     * obtenemos todos por el id del usuario logeado/registrado
     */
    static getAll = errorHandler(async (req: Request, res: Response) => {
        const {userId} = req.user!;
        if (!userId) {
            return ApiResponse.errorOperation(res, "token agotado, vuelva a iniciar sesion");
        }
        const results = await todoModel.getTodos(userId);
        if (!results) {
            return ApiResponse.errorOperation(res, "error interno al obtener todos", 500)
        }
        return ApiResponse.returnResult(res, results);
    });
    // creamos todo usando el id del usuario creado
    static createTodo = errorHandler(async (req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        const {userId} = req.user!;
        if (!userId) {
            return ApiResponse.errorOperation(res, "token agotado, vuelva a iniciar sesion");
        }
        const todoConverted: TodoManagement = {
            ...restOfBody
        };
        const todoRecorded = await todoModel.createTodo(userId, todoConverted);
        if (!todoRecorded) {
            return ApiResponse.errorOperation(res, "error interno al crear todo", 500)
        }
        return ApiResponse.operation(res, "tarea/chore creado correctamente", 201)
    });
    // actualizamos el todo (aqui podemos pasar por params el id del todo al no ser tan importante como el del usuario)
    static updateTodo = errorHandler(async (req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        const {todoId} = req.params;
        if (!String(todoId) || !todoId) {
            return ApiResponse.errorOperation(res, "identificacion del todo/chore incorrecto");
        }
        const todoConverted: TodoManagement = {
            ...restOfBody
        }
        const todoUpdated = await todoModel.updateTodo(String(todoId!), todoConverted);
        if (!todoUpdated) {
            return ApiResponse.errorOperation(res, "error interno al actualizar todo", 500)
        }
        return ApiResponse.operation(res, "tarea/chore actualizado correctamente")
    });
    // eliminar todo (con el id del todo)
    static deleteTodo = errorHandler(async (req: Request, res: Response) => {
        const {todoId} = req.params;
        if (!String(todoId) || !todoId) {
            return ApiResponse.errorOperation(res, "identificacion del todo/chore incorrecto");
        }
        const todoDeleted = await todoModel.deleteTodo(String(todoId!));
        if (!todoDeleted) {
            return ApiResponse.errorOperation(res, "error interno al eliminar todo", 500)
        }
        return ApiResponse.operation(res, "tarea/chore eliminado correctamente")
    });
}

export default TodoController;