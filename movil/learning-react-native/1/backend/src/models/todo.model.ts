import prismaConfig from "@/lib/prisma.lib.js";
import type { TodoManagement } from "@modelTypes/typos.bd.js";

class TodoModel {
    getTodos = async (userId: string) => {
        return await prismaConfig.todo.findMany({
            where: {
                userId: userId,
                active: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    };

    createTodo = async (id: string, todo: TodoManagement) => {
        return await prismaConfig.todo.create({
            data:{
                ...todo,
                userId: id,
            },
            select: {
                id: true,
            },
        });
    };

    updateTodo = async (todoId: string, todo: TodoManagement) => {
        return await prismaConfig.todo.update({
            where: {
                id: todoId,
            },
            data: todo,
            select: {
                id: true,
            },
        });
    };

    deleteTodo = async (todoId: string) => {
        return await prismaConfig.todo.update({
            where: {
                id: todoId,
            },
            data: {
                active: false,
            },
        });
    };
}

export default new TodoModel();