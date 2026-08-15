import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FormField } from "@/hooks/components/FormField";
import { todoSchema, type TodoFields } from "@/schemas/todo.schemas";
import { useTodosQuery, useCreateTodoMutation } from "@/hooks/useTodoMutation";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import type { CustomApiError, Todos } from "@/types/typos";

export default function TodosScreen() {
  const { data: todos, isLoading, isRefetching, refetch } = useTodosQuery();
  const createMutation = useCreateTodoMutation();
  const logout = useAuthStore((s) => s.logout);
  const { control, handleSubmit, reset } = useForm<TodoFields>({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: "", description: "" },
  });
  const handleLogout = () => {
    logout();
    router.replace("/(auth)");
  };

  const onSubmit = handleSubmit((data) => {
    createMutation.mutate(data, { onSuccess: () => reset() });
  });

  const renderItem = ({ item }: { item: Todos }) => (
    <View className="flex-row items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-2">
      <View className="flex-1 mr-2">
        <Text className="text-base font-semibold">{item.title}</Text>
        {item.description ? (
          <Text className="text-gray-500 text-sm">{item.description}</Text>
        ) : null}
      </View>
      {/* <Pressable onPress={() => deleteMutation.mutate(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </Pressable> */}
    </View>
  );

  return (
    <View className="flex-1 bg-white px-4 pt-14">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Mis tareas</Text>
        <Pressable onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#374151" />
        </Pressable>
      </View>

      <View className="mb-4">
        <FormField
          control={control}
          name="title"
          label="Nueva tarea"
          placeholder="Título"
        />
        <FormField
          control={control}
          name="description"
          label="Descripción (opcional)"
        />
        <Pressable
          onPress={onSubmit}
          disabled={createMutation.isPending}
          className="bg-blue-500 rounded-lg py-2 items-center"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Agregar</Text>
          )}
          {createMutation.error && (
            <Text className="text-red-500 text-sm mb-2">
              {((createMutation.error as unknown) as CustomApiError).message}
            </Text>
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-8">
              No tienes tareas aún
            </Text>
          }
        />
      )}
    </View>
  );
}
