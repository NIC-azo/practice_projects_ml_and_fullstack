export interface CustomApiError {
  status: number;
  message: string;
  isNetworkError: boolean;
}

export interface ErrorOperationsTypo {
  error: true;
  message: string;
}

export interface Todos {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string | null;
  description: string | null;
}
