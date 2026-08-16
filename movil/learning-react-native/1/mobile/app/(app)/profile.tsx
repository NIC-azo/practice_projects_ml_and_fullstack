import { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FormField } from "@/hooks/components/FormField";
import {
  profileUpdateSchema,
  type ProfileUpdateFields,
} from "@/schemas/profile.schemas";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "@/hooks/useProfileMutation";
import type {CustomApiError} from "@/types/typos"

export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const deleteMutation = useDeleteAccountMutation();

  const profileResolver: Resolver<ProfileUpdateFields> =
    zodResolver(profileUpdateSchema as any);

  const { control, handleSubmit, reset } = useForm<ProfileUpdateFields>({
    resolver: profileResolver,
    defaultValues: { userName: "", email: "", password: "" },
  });

  // precarga el form una vez que llegan los datos reales del perfil
  useEffect(() => {
    if (profile) {
      reset({ userName: profile.userName, email: profile.email, password: "" });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit((data) => updateMutation.mutate(data));

  const confirmDelete = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción no se puede deshacer. ¿Seguro que quieres continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate() },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-14">
      <Text className="text-2xl font-bold mb-6">Mi perfil</Text>

      <FormField control={control} name="userName" label="Usuario" autoCapitalize="none" />
      <FormField control={control} name="email" label="Correo" keyboardType="email-address" autoCapitalize="none" />
      <FormField control={control} name="password" label="Nueva contraseña (opcional)" secureTextEntry />

      {updateMutation.error && (
        <Text className="text-red-500 text-sm mb-3">
          {((updateMutation.error as unknown) as CustomApiError).message}
        </Text>
      )}
      {updateMutation.isSuccess && (
        <Text className="text-green-600 text-sm mb-3">Perfil actualizado</Text>
      )}

      <Pressable
        onPress={onSubmit}
        disabled={updateMutation.isPending}
        className="bg-blue-500 rounded-lg py-3 items-center mb-4"
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Guardar cambios</Text>
        )}
      </Pressable>

      <Pressable
        onPress={confirmDelete}
        disabled={deleteMutation.isPending}
        className="border border-red-500 rounded-lg py-3 items-center flex-row justify-center gap-2"
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
        <Text className="text-red-500 font-semibold">Eliminar cuenta</Text>
      </Pressable>
    </ScrollView>
  );
}
