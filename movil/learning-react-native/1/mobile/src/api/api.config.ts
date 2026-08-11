import Constants from "expo-constants";
import axios, { type AxiosError, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { CustomApiError, ErrorOperationsTypo } from "../types/typos";

const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:3000";
// conexion a la bd con un tiempo limite de 10 seg
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// para requerir algo debemos enviar el token
api.interceptors.request.use((config) => {
  const token = SecureStore.getItem("todoApp_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// para respuestas manejamos errores globales
api.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    const normalizedError: CustomApiError = {
      status: 500,
      message: "Error al obtener mensaje de la respuesta",
      isNetworkError: false,
    };
    if (axios.isAxiosError<ErrorOperationsTypo>(error)) {
      if (error.response) {
        normalizedError.status = error.response.status;
        normalizedError.message = error.response.data.message;
      } else if (error.request) {
        normalizedError.status = 0;
        normalizedError.message = "no se pudo conectar con el servidor";
        normalizedError.isNetworkError = true;
      } else {
        normalizedError.message = error.message;
      }
    }
    return Promise.reject(normalizedError);
  },
);

export const request = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.request<T>({ method, url, data, ...config });
  return response.data;
};

export default api;
