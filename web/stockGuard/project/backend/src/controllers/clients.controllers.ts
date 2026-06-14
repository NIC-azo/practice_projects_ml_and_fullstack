import type { Request, Response } from "express";
import { errorHandler } from "@/middlewares/errors.middlewares.js";
import { ApiResponse } from "@/utils/typos.express.js";
import clientsModel from "@/models/clients.model.js";
import type { modelClients, updateClients } from "@/types/bd.types.js";

class ClientsController {
    static getClients = errorHandler(async (req: Request, res: Response) => {
        const results = await clientsModel.getClientsDinamicly();
        if (!results || results === undefined) {
            return ApiResponse.errorOperations(res, "error interno al obtener clientes", 500)
        }
        return ApiResponse.returnResults(res, results)
    });
    static createclients = errorHandler(async (req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        if (Object.keys(restOfBody).length < 1 || restOfBody === undefined) {
            return ApiResponse.errorOperations(res, 
                "se necesita por lo menos el nombre del cliente para crearlo")
        }
        if (String(restOfBody.name)) {
            const userFound = await clientsModel.getClientForController(String(restOfBody.name));
            if (userFound) {
                return ApiResponse.errorOperations(res, "ya existe un cliente creado con el mismo nombre");
            }
        }
        if (String(restOfBody.email)) {
            const userFound = await clientsModel.getClientForController(String(restOfBody.email));
            if (userFound) {
                return ApiResponse.errorOperations(res,
                    "ya existe un cliente con el mismo email");
            }
        }
        if (String(restOfBody.dni)){
            const userFound = await clientsModel.getClientForController(String(restOfBody.dni));
            if (userFound){
                return ApiResponse.errorOperations(res, 
                    "ya existe un cliente con el mismo dni")
            }
        }
        if (String(restOfBody.ruc)){
            const userFound = await clientsModel.getClientForController(String(restOfBody.ruc));
            if (userFound){
                return ApiResponse.errorOperations(res, 
                    "ya existe un cliente con el mismo ruc")
            }
        }
        if (String(restOfBody.cellPhone)){
            const userFound = await clientsModel.getClientForController(String(restOfBody.cellPhone));
            if (userFound){
                return ApiResponse.errorOperations(res, 
                    "ya existe un cliente con el mismo numero telefonico")
            }
        }
        const clientConverted: modelClients = {
            ...restOfBody
        }
        const clientCreated = await clientsModel.createClients(clientConverted);
        if (clientCreated === undefined || !clientCreated){
            return ApiResponse.errorOperations(res, 
                "error interno al crear al cliente", 500)
        }
        return ApiResponse.operations(res, "cliente creado correctamente", 201)
    });
    static updateclients = errorHandler(async (req: Request, res: Response) => {
        const {id_client} = req.params;
        const {...restOfBody} = req.body;
        if (String(id_client) === undefined || !id_client){
            return ApiResponse.errorOperations(res, 
                "se necesita identificacion del cliente para actualizar")
        }
        if (String(restOfBody.name)) {
            const userFound = await clientsModel.getClientForController(String(restOfBody.name));
            if (userFound) {
                return ApiResponse.errorOperations(res, "ya existe un cliente creado con el mismo nombre");
            }
        }
        if (String(restOfBody.email)) {
            const userFound = await clientsModel.getClientForController(String(restOfBody.email));
            if (userFound) {
                return ApiResponse.errorOperations(res,
                    "ya existe un cliente con el mismo email");
            }
        }
        if (String(restOfBody.dni)){
            const userFound = await clientsModel.getClientForController(String(restOfBody.dni));
            if (userFound){
                return ApiResponse.errorOperations(res, 
                    "ya existe un cliente con el mismo dni")
            }
        }
        if (String(restOfBody.ruc)){
            const userFound = await clientsModel.getClientForController(String(restOfBody.ruc));
            if (userFound){
                return ApiResponse.errorOperations(res, 
                    "ya existe un cliente con el mismo ruc")
            }
        }
        if (String(restOfBody.cellPhone)){
            const userFound = await clientsModel.getClientForController(String(restOfBody.cellPhone));
            if (userFound){
                return ApiResponse.errorOperations(res, 
                    "ya existe un cliente con el mismo numero telefonico")
            }
        }
        const clientConverted: updateClients = {
            ...restOfBody
        }
        const clientUpdated = await clientsModel.updateClients(String(id_client!), clientConverted);
        if (clientUpdated === undefined || !clientUpdated){
            return ApiResponse.errorOperations(res, 
                "error interno al actualizar al cliente", 500)
        }
        return ApiResponse.operations(res, "cliente actualizado correctamente")
    });
    static deleteClients = errorHandler(async (req: Request, res: Response) => {
        const {id_client} = req.params;
        if (String(id_client) === undefined || !id_client){
            return ApiResponse.errorOperations(res, 
                "se necesita identificacion del cliente para actualizar")
        }
        const clientDeleted = await clientsModel.deleteClients(String(id_client!));
        if (clientDeleted === undefined || !clientDeleted) {
            return ApiResponse.errorOperations(res, 
                "error interno al eliminar el cliente", 500)
        }
        return ApiResponse.operations(res, "cliente eliminado correctamente")
    })
}

export default ClientsController;