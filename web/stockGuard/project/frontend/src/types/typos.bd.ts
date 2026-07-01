export type Rol = 'ADMIN' | 'ALMACENERO';

export interface UserForTypos {
    userId: string;
    rol: Rol;
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

export interface ThemeStoreInterface {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
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
    rol: Rol;
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
        rol: Rol;
    };
    detail: Array<{
        quantity: number;
        actual_price: number;
        product: {
            name: string;
        };
    }>
}

export interface ProductsAlertResponse {
    alerts: number;
}

export interface AdminDataReportsResponse {
    totalInventoryValue: number;
    sellsToday: number;
    usersTotal: number;
}

export interface NavItems {
    to: string;
    icon: string;
    label: string;
    adminOnly?: boolean;
} 

export type FormType = 'USERS' | 'PRODUCTS' | 'CLIENTS';

export interface KpisInterface {
    label: string;
    value: string;
    icon: string;
    color: string;
}