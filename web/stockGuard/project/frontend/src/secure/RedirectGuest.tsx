import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const RedirectGuest = () => {
    const {isAutenticated, user} = useAuthStore();

    if (isAutenticated && user) {
        return <Navigate to={"/dashboard"} replace />;
    }

    return <Outlet />
}

export default RedirectGuest;