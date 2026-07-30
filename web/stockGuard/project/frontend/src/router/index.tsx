import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "@/secure/ProtectedRoutes";
import Login from "@/app/pages/Login";
import RedirectGuest from "@/secure/RedirectGuest";
import MainLayout from "@/layout/MainLayout";
import Dashboard from "@/app/pages/Dashboard";
import ProductsPage from "@/app/pages/ProductsPage";
import POSPage from "@/app/pages/POSPage";
import ClientsPage from "@/app/pages/ClientsPage";
import UsersPage from "@/app/pages/UsersPage";
import HistoryPage from "@/app/pages/HistoryPage";
import ProfilePage from "@/app/pages/ProfilePage";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";

const AppRouter = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/**1. Redirección Raíz: Si alguien entra a "/" lo mandamos directo al flujo de /dashboard */}
      <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
      {/**2. Filtro para Invitados: Si ya están logueados, RedirectGuest los expulsa a /dashboard  */}
      <Route element={<RedirectGuest />}>
        <Route path="/login" element={<Login />} />
      </Route>
      {/**3. RUTAS PROTEGIDAS MAESTRAS (Requieren autenticación) */}
      {/** Ambos roles pueden acceder a este bloque general  */}
      <Route
        element={<ProtectedRoutes allowedRoles={["ADMIN", "ALMACENERO"]} />}
      >
        {/* Inyectamos el diseño base con la barra lateral y el ThemeToggle */}
        <Route element={<MainLayout />}>
          {/** El Dashboard es compartido. Tu lógica interna renderiza los KPIs del Admin o del Almacenero*/}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />}></Route>
          <Route path="/pos" element={<POSPage />}></Route>
          <Route path="/clients" element={<ClientsPage />}></Route>
          {/* Módulo de Perfil o configuraciones comunes */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
        {/* Inyectamos el diseño base con la barra lateral y el ThemeToggle */}
        <Route element={<MainLayout />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>
      {/* 5. Ruta de Escape en caso de accesos denegados o páginas no encontradas */}
      <Route
        path="/unauthorized"
        element={
          <div className="flex h-screen items-center justify-center font-bold">
            No tienes permisos para ver esto.
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
