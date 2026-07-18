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

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        if (error.status === 401) {
          logout();
          navigate("/logout", { state: { from: location }, replace: true });
        } else if (error.status === 403) {
          navigate("/unauthorized", { replace: true });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: any) => {
        if (error.status === 401) {
          logout();
          navigate("/logout", { state: { from: location }, replace: true });
        } else if (error.status === 403) {
          navigate("/unauthorized", { replace: true });
        }
      },
    }),
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
