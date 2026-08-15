import {z} from "zod"

export const todoSchema = z.object({
  title: z.string().min(1, "Requerido"),
  description: z.string().optional(),
});

export type TodoFields = z.infer<typeof todoSchema>;