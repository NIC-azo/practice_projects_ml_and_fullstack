import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useLocation } from "react-router-dom";
import type { Rol } from "@/types/typos.bd";

function ProtectedRoutes (
    {allowedRoles} : {
        allowedRoles: Rol[]
    }
) {
    const {isAutenticated, user} = useAuthStore();
    const location = useLocation();

    if (!isAutenticated) {
        return <Navigate to={'/login'} state={{from: location}} replace/>
    }
    if (!allowedRoles.includes(user!.rol)) {
        return <Navigate to={'/unauthorized'} replace />
    }

    return <Outlet />
}

export default ProtectedRoutes;