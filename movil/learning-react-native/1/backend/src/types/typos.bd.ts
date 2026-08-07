export interface UserManagement {
    userName: string;
    email: string;
    passwordHashed: string;
}

export interface JWTPayload {
    userId: string;
}

export interface UserUpdate {
    userName?: string;
    email?: string;
    passwordHashed?: string;
}

export interface TodoManagement {
    title?: string;
    description?: string;
}