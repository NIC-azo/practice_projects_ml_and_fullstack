import '../global.css';
import { useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth.store";
import { Stack } from "expo-router";

function RootNavigator() {
  // obtenemos si esta autenticado
  const isAuthenticated = useAuthStore((s) => s.isAutenticated);
  // obtenemos si ya ha "rehidratado" la sesion
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  // cuando se renderize la pagina llamamos a hydrate y por deps
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  // si no ha recargado, retornamos null o un loading screen (aunque prefiriria un mensaje con loading)
  if (!isHydrated) {
    return null; // o un splash/loading screen
  }
  // retornamos Stack->Stack.Protected que protege cada ruta/page (auth si no esta autenticado)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="/(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="/(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
// ahora si podemos envolver todo con QueryClientProvider con queryClient configurado y envolviendo
// las paginas
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}