import api  from "@/api/axios.api";
import type { AxiosRequestConfig } from "axios";

export async function request<T> (
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> {
    const response = await api.request<T>({method, url, data, ...config})
    return response.data;
}