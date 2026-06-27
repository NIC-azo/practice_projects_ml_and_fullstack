import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const RedirectGuest = () => {
    const {isAutenticated, user} = useAuthStore();

    if (isAutenticated && user) {
        const redirectTo = user.rol === "ADMIN" ? '/admin/users' : '/almacenero/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />
}

export default RedirectGuest;