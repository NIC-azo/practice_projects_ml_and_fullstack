import type { CustomApiError, ErrorOperationsTypo } from "@/types/typos.bd";
import axios from "axios";

const ENVIRONMENT = import.meta.env["VITE_NODE_ENV"];

const api = axios.create({
    baseURL: ENVIRONMENT === "dev" ? "VITE_LOCAL_API_URL" : "VITE_API_URL",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("stockGuard-token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (config) => {
        return config
    },
    (error) => {
        const normalizedError: CustomApiError = {
            status: 500,
            message: "Error al obtener mensaje de la respuesta",
            isNetworkError: false,
        };
        if (axios.isAxiosError<ErrorOperationsTypo>(error)){
            if (error.response){
                normalizedError.status = error.response.status;
                normalizedError.message = error.response.data.message;
            } else if (error.request) {
                normalizedError.status = 0;
                normalizedError.message = "no se pudo conectar con el servidor"
                normalizedError.isNetworkError = true
            } else {
                normalizedError.message = error.message;
            }
        }
        return Promise.reject(normalizedError);
    }
)

export default api