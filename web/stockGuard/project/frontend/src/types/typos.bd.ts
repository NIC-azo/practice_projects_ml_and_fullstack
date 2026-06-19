export interface UserForTypos {
    userId: string;
    rol: "ADMIN" | "ALMACENERO";
}

export interface AuthResponseTypo {
    token: string;
    message: string;
    user: UserForTypos;
}

export interface ReturnResultsTypo<T> {
    data: T;
}

export interface OperationsResTypo {
    message: string;
}

export interface ErrorOperationsTypo {
    error: true;
    message: string;
}

export interface AuthStoreInterface {
    isAutenticated: boolean;
    token: string | null;
    user: UserForTypos | null;
    login: (token: string, user: UserForTypos) => void;
    logout: () => void;
    checkAuth: () => boolean;
};   

export interface CustomApiError {
    status: number;
    message: string;
    isNetworkError: boolean;
}

export interface ClientsResponseData {
    name: string;
    id: string;
    email: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    dni: string | null;
    ruc: string | null;
    cellPhone: string | null;
}

export interface UsersResponseData {
    name: string;
    id: string;
    email: string;
    rol: "ADMIN" | "ALMACENERO";
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponseData {
    name: string;
    id: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    bars_code: string;
    lote: string | null;
    expiration_date: string;
    unity_price: number;
    limit_minor_adquirition: number;
    minorsale_price: number;
    wholesale_price: number;
    current_stock: number;
    minimun_stock: number;
}

export interface HistoryResponseData {
    client: {
        name: string;
        dni: string | null;
    };
    createdAt: Date;
    voucher: "BOLETA" | "FACTURA";
    status: "CANCELADO" | "EN_PROCESO" | "ANULADO";
    total: number;
    user: {
        name: string;
        rol: "ADMIN" | "ALMACENERO";
    };
    detail: Array<{
        quantity: number;
        actual_price: number;
        product: {
            name: string;
        };
    }>
}