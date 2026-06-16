export interface AuthResponseTypo {
    token: string;
    message: string;
    user: {
        userId: string;
        rol: "ADMIN" | "ALMACENERO";
    }
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

export interface ClientsResponseData {
    name: string;
    id: string;
    email: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    dni: string | null;
    ruc: string | null;
    cellPhone: string | null;
}