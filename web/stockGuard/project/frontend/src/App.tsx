/* eslint-disable @typescript-eslint/no-explicit-any */
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

// 1. Creamos un componente interno que está DENTRO del BrowserRouter
function QueryProviderWithRouter() {
  const navigate = useNavigate(); // ✅ Ahora es 100% seguro porque BrowserRouter ya existe arriba
  const location = useLocation();
  const { logout } = useAuthStore();

  // Inicializamos el QueryClient aquí adentro para vincular las redirecciones globales
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        if (error.status === 401) {
          logout();
          // "/login" para el flujo de retorno
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
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// 2. El componente raíz solo se encarga de montar el Router general
function App() {
  return (
    <BrowserRouter>
      <QueryProviderWithRouter />
    </BrowserRouter>
  );
}

export default App;
