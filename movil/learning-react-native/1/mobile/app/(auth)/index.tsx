import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FormField } from "@/hooks/components/FormField";
import { loginSchema, registerSchema, type LoginFields, type RegisterFields } from "@/schemas/auth.schemas";
import { useLoginMutation, useRegisterMutation } from "@/hooks/useAuthMutations";
import type { CustomApiError } from "@/types/typos";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const isLogin = mode === "login";

  const loginForm = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFields>({ resolver: zodResolver(registerSchema) });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const onSubmitLogin = loginForm.handleSubmit((data) => loginMutation.mutate(data));
  const onSubmitRegister = registerForm.handleSubmit((data) =>
    registerMutation.mutate(data, { onSuccess: () => setMode("login") }),
  );

  const activeError = (isLogin ? loginMutation.error : registerMutation.error) as
    | CustomApiError
    | null;
  const isPending = isLogin ? loginMutation.isPending : registerMutation.isPending;

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <View className="items-center mb-8">
        <Ionicons name="checkbox-outline" size={48} color="#3b82f6" />
        <Text className="text-2xl font-bold mt-2">{isLogin ? "Iniciar sesión" : "Crear cuenta"}</Text>
      </View>

      {isLogin ? (
        <>
          <FormField control={loginForm.control} name="email" label="Correo" keyboardType="email-address" autoCapitalize="none" />
          <FormField control={loginForm.control} name="password" label="Contraseña" secureTextEntry />
        </>
      ) : (
        <>
          <FormField control={registerForm.control} name="userName" label="Usuario" autoCapitalize="none" />
          <FormField control={registerForm.control} name="email" label="Correo" keyboardType="email-address" autoCapitalize="none" />
          <FormField control={registerForm.control} name="password" label="Contraseña" secureTextEntry />
        </>
      )}

      {activeError && <Text className="text-red-500 text-sm mb-3">{activeError.message}</Text>}

      <Pressable
        onPress={isLogin ? onSubmitLogin : onSubmitRegister}
        disabled={isPending}
        className="bg-blue-500 rounded-lg py-3 items-center mb-4"
      >
        {isPending ? <ActivityIndicator color="white" /> : (
          <Text className="text-white font-semibold">{isLogin ? "Entrar" : "Registrarme"}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => setMode(isLogin ? "register" : "login")}>
        <Text className="text-center text-blue-500">
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </Text>
      </Pressable>
    </View>
  );
}