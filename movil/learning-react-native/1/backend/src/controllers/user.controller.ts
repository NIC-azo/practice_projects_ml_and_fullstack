import userModel from "@/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorHandler } from "@/middlewares/errors.middleware.js";
import { ApiResponse } from "@/utils/api.response.helper.js";
import type { Request, Response } from "express";
import "dotenv/config";
import type { UserUpdate } from "@modelTypes/typos.bd.js";

class UsersController {
  static login = errorHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (String(email).length < 0 || !email || !String(email).includes("@")) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    const userGotten = await userModel.getUserByemail(String(email!));
    if (userGotten === undefined || !userGotten) {
      return ApiResponse.errorOperation(res, "error al procesar login", 500);
    }
    if (String(password).length < 6 || String(password) === undefined) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    const userFound = await bcrypt.compare(
      String(password!),
      userGotten.passwordHashed,
    );
    if (!userFound) {
      return ApiResponse.errorOperation(res, "error interno al logear", 500);
    }
    const genToken = jwt.sign(
      { userId: userGotten.id },
      process.env["JWT_SECRET"] ?? "",
      { expiresIn: "24h" },
    );
    return ApiResponse.auth(
      res,
      genToken,
      "autenticado correctamente, dirigiendo ",
      userGotten.id,
    );
  });
  /**
   * necesitamos el username, email y password del usuario a registrar
   * vamos a validar que el usuario no este duplicado o que no se duplique
   * despues podemos llamar a los metodos correspondientes para poder crear al usuario
   * (hasheando el password y luego llamando al metodo del model correspondiente)
   */
  static register = errorHandler(async (req: Request, res: Response) => {
    const { userName, email, password } = req.body;
    if (String(userName).length < 0 || !userName) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    if (String(email).length < 0 || !email || !String(email).includes("@")) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    if (String(password).length < 6 || String(password) === undefined) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    const validateUsernameDupplicated = await userModel.getUserByNickName(
      String(userName!),
    );
    if (validateUsernameDupplicated) {
      return ApiResponse.errorOperation(
        res,
        "ya existe un usuario con el mismo nombre de usuario, intentelo denuevo",
      );
    }
    const validateEmailNotDupplicated = await userModel.getUserByemail(
      String(email!),
    );
    if (validateEmailNotDupplicated) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    const salts = Number(process.env["SALT_ROUNDS"]);
    const passwordHashed = await bcrypt.hash(String(password!), salts);
    const userRecorded = await userModel.registerUser({
      userName: String(userName!),
      email: String(email!),
      passwordHashed: passwordHashed,
    });
    if (!userRecorded) {
      return ApiResponse.errorOperation(res, "error interno al registrar", 500);
    }
    return ApiResponse.operation(res, "Registrado correctamente", 201);
  });
  /**
   * aqui usaremos el id del usuario pero sin pasarlo por parametros
   * luego hacemos las validaciones por si es que en el objeto estan (username, email)
   * luego procedemos con convertir el objeto al interface de UpdateUser de mi typos
   * para usarlo en el metodo correspondiente del model y asi devolver resultado
   */
  static updateUser = errorHandler(async (req: Request, res: Response) => {
    const { ...restOfBody } = req.body;
    const { userId } = req.user!;
    if (!userId) {
      return ApiResponse.errorOperation(
        res,
        "token agotado, vuelva a iniciar sesion",
      );
    }
    if (String(restOfBody.password) && String(restOfBody.password).length < 6) {
      return ApiResponse.errorOperation(res, "credenciales incorrectas");
    }
    if (String(restOfBody.userName)) {
      if (String(restOfBody.userName).length < 0) {
        return ApiResponse.errorOperation(res, "credenciales incorrectas");
      }
      const userFound = await userModel.getUserByNickName(
        String(restOfBody.userName!),
      );
      if (userFound && userFound.id !== userId) {
        return ApiResponse.errorOperation(
          res,
          "ya existe un usuario con el mismo nickname, intentelo denuevo",
        );
      }
    }
    if (String(restOfBody.email)) {
      if (
        String(restOfBody.email).length < 0 ||
        !String(restOfBody.email).includes("@")
      ) {
        return ApiResponse.errorOperation(res, "credenciales incorrectas");
      }
      const userFound = await userModel.getUserByemail(
        String(restOfBody.email!),
      );
      if (userFound && userFound.id !== userId) {
        return ApiResponse.errorOperation(
          res,
          "credenciales incorrectas, intentelo denuevo",
        );
      }
    }
    const { password, ...rest } = restOfBody;
    const userConverted: UserUpdate = {
      ...rest,
      ...(password
        ? {
            passwordHashed: await bcrypt.hash(
              String(password),
              Number(process.env["SALT_ROUNDS"]),
            ),
          }
        : {}),
    };
    const userUpdated = await userModel.updateUser(userId, userConverted);
    if (!userUpdated) {
      return ApiResponse.errorOperation(
        res,
        "error interno al actualizar usuario",
        500,
      );
    }
    return ApiResponse.operation(res, "usuario actualizado correctamente", 200);
  });
  /**
   * solo necesitamos el id del usuario para eliminarlo
   * para eso validamos el id del usuario
   */
  static deleteUser = errorHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    if (!userId) {
      return ApiResponse.errorOperation(
        res,
        "token agotado, vuelva a iniciar sesion",
      );
    }
    const userDeleted = await userModel.deleteUser(userId);
    if (userDeleted === undefined) {
      return ApiResponse.errorOperation(
        res,
        "error interno al eliminar usuario",
      );
    }
    return ApiResponse.operation(res, "usuario eliminado correctamente");
  });
  /**
   * obtener datos para perfilar usuario
   */
  static profileUser = errorHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    if (!userId) {
      return ApiResponse.errorOperation(
        res,
        "token agotado, vuelva a iniciar sesion",
      );
    }
    const result = await userModel.getUserById(userId);
    if (!result) {
      return ApiResponse.errorOperation(
        res,
        "no se encontro al usuario o no esta identificado",
        500,
      );
    }
    return ApiResponse.returnResult(res, result);
  });
}

export default UsersController;
