import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";
import { request } from "@/api/request.config";
import type {AuthResponseTypo, CustomApiError} from "@/types/typos.bd"

function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPass, setShowPass] = useState<boolean>(false);
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
            navigate("/dashboard", {replace: true})
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
            {error.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 
                    animate-fade-in-form-modal duration-200">
                    <div className="relative w-full max-w-md bg-background-emojis-color-alert p-6 rounded-2xl shadow-blur-for-shadows">
                        <button className="absolute top-4 right-4 text-color-text-button hover:bg-color-text-button/40 
                            animate-fade-out-form-modal p-1.5 rounded-lg transition-colors flex items-center justify-center" 
                            aria-label="cerrar" type="button" onClick={() => setError('')}><i className="fa-solid fa-square-xmark text-xl"/></button>
                        <div className="pr-6">
                            <p className="text-lg font-bold text-color-text-general leading-snug">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="relative w-full max-w-sm mx-4">
                <div className="rounded-2xl p-8 border">
                    <div className="flex flex-col items-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20">
                            <i className="fa-solid fa-store bg-background-emojis-color hover:bg-background-emojis-color/20"/>
                        </div>
                        <h1 className="text-4xl font-bold text-color-text-general mb-2">Stock Guard</h1>
                        <p className="text-color-text-general">Ingresa tus credenciales para continuar</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1.5 text-color-text-general">CORREO ELECTRONICO</label>
                            <input
                                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/10"
                                type="email"
                                placeholder="ejemplo@empresa.com"
                                onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => setEmail(e.target.value)}
                                value={email}
                                onFocus={(e: React.FocusEvent<HTMLInputElement, Element>) => (e.target.style.borderColor = 'var(--color-color-text-general)')}
                                onBlur={(e: React.FocusEvent<HTMLInputElement, Element>) => (e.target.style.borderColor = 'var(--shadow-blur-for-shadows)')} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5 text-color-text-general">CONTRASEÑA</label>
                            <div className="relative">
                                <input 
                                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/10"
                                type={showPass ? 'text' : 'password'}
                                placeholder="ej3mpl0#%$" 
                                onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => setPassword(e.target.value)}
                                value={password}
                                onFocus={(e: React.FocusEvent<HTMLInputElement, Element>) => (e.target.style.borderColor = 'var(--color-color-text-general)')}
                                onBlur={(e: React.FocusEvent<HTMLInputElement, Element>) => (e.target.style.borderColor = 'var(--shadow-blur-for-shadows)')}
                                />
                                <button 
                                    onClick={() => setShowPass(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-50 text-color-text-button/10"
                                    type="button"
                                    aria-label="mostrar contraseña"
                                    >
                                    {showPass ? <i className="fa-solid fa-eye"/> : <i className="fa-solid fa-eye-slash"/>}
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-center
                            gap-2 mt-2` +  loading ? `bg-gray-600` : `bg-background-buttons` + 'text-color-text-general' + loading ? 'cursor-not-allowed' : 'cursor-pointer'}
                            aria-label="iniciar sesion"
                            >
                            {loading && <i className="fa-solid fa-spinner animate-spin"/>}
                            {loading ? 'iniciando sesión' : 'iniciar sesión'}
                        </button>
                    </form>
                    <p className="">
                        Stock Guard
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;