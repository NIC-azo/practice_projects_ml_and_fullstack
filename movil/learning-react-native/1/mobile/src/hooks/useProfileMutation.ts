import { request } from "@/api/api.config";
import type { ProfileUpdateFields } from "@/schemas/profile.schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  OperationResponseTypo,
  ReturnResultsTypo,
  UserForProfile,
} from "@/types/typos";
import {useAuthStore} from "@/store/auth.store"
import { router } from "expo-router";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await request<ReturnResultsTypo<UserForProfile>>(
        "get",
        "/profile/",
      );
      return response.data ?? [];
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateFields) =>
      request<OperationResponseTypo>("put", "/profile/update", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
  });
}

export function useDeleteAccountMutation() {
    const logout = useAuthStore((s) => s.logout);
    return useMutation({
        mutationFn: () => request<OperationResponseTypo>("delete", "/profile/delete"),
        onSuccess: () => {
            logout();
            router.push("/(auth)");
        },
    });
}