import { request } from "@/api/api.config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {TodoFields} from "@/schemas/todo.schemas"
import type {
  ReturnResultsTypo,
  Todos,
  OperationResponseTypo,
} from "@/types/typos";

export const TODOS_QUERY_KEY = ["todos"] as const;

export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: async () => {
      const response = await request<ReturnResultsTypo<Todos[]>>("get", "/todos/");
      return response.data ?? []
    },
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TodoFields) =>
      request<OperationResponseTypo>("post", "/todos/create", data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY }),
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoFields }) =>
      request<OperationResponseTypo>("put", `/todos/update/${id}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY }),
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      request<OperationResponseTypo>("delete", `/todos/delete/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY }),
  });
}
