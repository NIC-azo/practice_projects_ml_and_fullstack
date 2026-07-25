/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import AppRouter from "@/router/index";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function QueryProviderWithRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  // ✅ SOLUCIÓN: Usamos useState con inicialización diferida (() => new QueryClient)
  // De esta forma React crea la instancia UNA SOLA VEZ al montar el componente.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            if (error.status === 401) {
              logout();
              navigate("/login", { state: { from: location }, replace: true });
            } else if (error.status === 403) {
              navigate("/unauthorized", { replace: true });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            if (error.status === 401) {
              logout();
              navigate("/login", { state: { from: location }, replace: true });
            } else if (error.status === 403) {
              navigate("/unauthorized", { replace: true });
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryProviderWithRouter />
    </BrowserRouter>
  );
}

export default App;