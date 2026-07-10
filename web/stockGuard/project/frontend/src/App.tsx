import { BrowserRouter } from "react-router-dom"
import AppRouter from "@/router/index"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ReactQueryDevtools initialIsOpen={false}/>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
