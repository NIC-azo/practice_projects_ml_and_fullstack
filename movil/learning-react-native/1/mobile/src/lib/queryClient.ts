import {QueryClient, QueryCache, MutationCache} from "@tanstack/react-query"
import { router } from "expo-router"
import { useAuthStore } from "@/store/auth.store"
import type { CustomApiError } from "@/types/typos"

// para usar en _layout.tsx (helper para cuando se le haya acabado el tiempo al usuario en la app)
function handleAuthError(error: unknown) {
    const err = error as CustomApiError;
    if (err.status === 401) {
        useAuthStore.getState().logout();
        router.replace('/(auth)');
    }
}
// exportamos instancia de QueryClient para cuando haya un error en la obtencion de datos como
// en la modificacion de cada tabla de la BD se dispare la funcion y redirija al usuario a login page
export const queryClient = new QueryClient({
    queryCache: new QueryCache({onError: handleAuthError}),
    mutationCache: new MutationCache({onError: handleAuthError}),
});