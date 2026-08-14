import { z } from "zod";
// esquemas para que el usuario ingrese bien los datos
export const loginSchema = z.object({
  email: z.string().email("Correo Invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
});

export const registerSchema = z.object({
  userName: z.string().min(1, "Requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
// convertidos a type
export type LoginFields = z.infer<typeof loginSchema>
export type RegisterFields = z.infer<typeof registerSchema>