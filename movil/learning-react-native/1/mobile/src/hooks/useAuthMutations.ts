import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { request } from "@/api/api.config";
import type { LoginFields, RegisterFields } from "@/schemas/auth.schemas";
import { useAuthStore } from "@/store/auth.store";
import type { AuthResponse, OperationResponseTypo } from "@/types/typos";

// mutation para login
export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: LoginFields) =>
      request<AuthResponse>("post", "/auth/login", data),
    // si exito->obtener token e id->dirigir a (app)
    onSuccess: (data) => {
      login(data.token, data.userId);
      router.replace("/(app)");
    },
  });
}
// pa registrar, solo accion de registro y obtenemos mensaje
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: RegisterFields) =>
      request<OperationResponseTypo>("post", "/auth/register", data),
  });
}
