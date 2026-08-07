import type { Request, Response, NextFunction } from "express";
// para no usar try/catch devolviendo promesa de atrapar la siguiente funcion o accion segun si hay error
export const errorHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  };
