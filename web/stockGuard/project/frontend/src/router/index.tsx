import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "@/secure/ProtectedRoutes";
import Login from "@/app/pages/Login";
import RedirectGuest from "@/secure/RedirectGuest";
import MainLayout from "@/layout/MainLayout";
import Dashboard from "@/app/pages/Dashboard";

const AppRouter = () => (
    <Routes>
        <Route path="/" element={<Navigate to={"/dashboard"} replace />}/>
        <Route element={<RedirectGuest />}>
            <Route path="/login" element={<Login />}/>
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={["ADMIN", "ALMACENERO"]}/>}>
            <Route element={<MainLayout />}>
                <Route path="/dashboard"element={<Dashboard />}/>
            </Route>
        </Route>
    </Routes>
);

export default AppRouter;