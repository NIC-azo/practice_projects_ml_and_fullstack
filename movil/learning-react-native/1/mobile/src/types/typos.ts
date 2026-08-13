export interface CustomApiError {
  status: number;
  message: string;
  isNetworkError: boolean;
}

export interface AuthResponse {
  token: string;
  message: string;
  userId: string;
}

export interface UserForProfile {
  id: string;
  userName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnResultsTypo<T> {
  data: T;
}

export interface OperationResponseTypo {
  message: string;
}

export interface ErrorOperationsTypo {
  error: true;
  message: string;
}

export interface AuthStoreHelper {
  isAutenticated: boolean;
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export interface Todos {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string | null;
  description: string | null;
}

export interface TodoManagement {
  title?: string;
  description?: string;
}
