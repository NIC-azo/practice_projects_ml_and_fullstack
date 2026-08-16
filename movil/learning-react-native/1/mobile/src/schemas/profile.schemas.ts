import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const profileUpdateSchema = z.object({
  userName: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  email: z.preprocess(emptyToUndefined, z.string().email("Correo inválido").optional()),
  password: z.preprocess(emptyToUndefined, z.string().min(6, "Mínimo 6 caracteres").optional()),
});

export type ProfileUpdateFields = z.infer<typeof profileUpdateSchema>;