export type Rol = 'ADMIN' | 'ALMACENERO'
export type TypeVoucher = 'BOLETA' | 'FACTURA'
export type Status = 'CANCELADO' 
| 'EN_PROCESO' | 'ANULADO';

export interface modelUser {
    name: string;
    email    : string
    password : string     
    Rol      : Rol
}
export interface modelClients {
    name : string;
    email? : string;
    dni? : string;
    ruc? : string;
    cellPhone? : string;
}

export interface modelProducts {
    name : string;
    bars_code: string;
    lote?: string;
    expiration_date: Date;
    unity_price: number;
    wholesale_price: number;
    current_stock: number;
    minimun_stock: number;
}

export interface InitSell {
    clientId: string;
    typeVoucher: TypeVoucher;
    itemsSelected: Array<{
        productId: string;
        quantity: number;
    }>
}

export interface JwtPayload {
    userId: string;
    rol: Rol;
}

export interface AuthResponse {
    token: string;
    message: string;
    user: {
        userId: string;
        rol: Rol;
    }
}