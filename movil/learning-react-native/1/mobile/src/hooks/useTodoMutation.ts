import { request } from "@/api/api.config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ReturnResultsTypo,
  TodoManagement,
  Todos,
  OperationResponseTypo,
} from "@/types/typos";

export const TODOS_QUERY_KEY = ["todos"] as const;

export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: async () =>
      (await request<ReturnResultsTypo<Todos[]>>("get", "/todos/")).data,
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TodoManagement) =>
      request<OperationResponseTypo>("post", "/todos/create", data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY }),
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoManagement }) =>
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
