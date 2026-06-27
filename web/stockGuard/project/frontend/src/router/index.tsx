import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "@/secure/ProtectedRoutes";
import Login from "@/app/pages/Login";
import RedirectGuest from "@/secure/RedirectGuest";

const AppRouter = () => (
    <Routes>
        <Route element={<RedirectGuest />}>
            <Route path="/login" element={<Login />}/>
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={["ADMIN", "ALMACENERO"]}/>}>
            <Route>
                <Route path="/"/>
            </Route>
        </Route>
    </Routes>
);

export default AppRouter;