import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";
import { request } from "@/api/request.config";
import type {AuthResponseTypo, CustomApiError} from "@/types/typos.bd"

function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const {login} = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const response = await request<AuthResponseTypo>("post", "/auth/login", formData);
            login(response.token, response.user);
            if (response.user.rol === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/almacenero");
            }
            clearFields();
        } catch (error) {
            const errorConfigured = error as CustomApiError;

            if (errorConfigured.isNetworkError) {
                setError(errorConfigured.message || "Error de conexion con el servidor")
            }
            if (errorConfigured.status === 401) {
                setError(errorConfigured.message || "su sesion a expirado, vuelva a logearse denuevo")
            }
            if (errorConfigured.status === 403) {
                setError(errorConfigured.message || "No tiene permiso de administrador para esta accion")
            }
        } finally {
            setLoading(false);
        }
    }

    const clearFields = () => {
        setEmail("");
        setPassword("");
    }

    return (
        <div className="min-h-screen bg-background-dinamyc-general flex items-center justify-center">
            <div
                className="absolute " 
            />
            <div className="relative w-full max-w-sm mx-4">
                <div className="rounded-2xl p-8 border">
                    <div className="flex flex-col items-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20">
                            <i className="fa-solid fa-store bg-background-emojis-color hover:bg-background-emojis-color/20"/>
                        </div>
                        <h1 className="text-4xl font-bold text-color-text-general mb-2">Stock Guard</h1>
                        <p className="text-color-text-general">Ingresa tus credenciales para continuar</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;