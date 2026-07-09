import { request } from "@/api/request.config";
import type {
  ProductsResponseData,
  ErrorOperationsTypo,
  OperationsResTypo,
  CustomApiError,
} from "@/types/typos.bd";
import { useState, useEffect, useMemo, useCallback } from "react";
import DinamycForm from "@/app/components/ui/form/DinamycForm";
import { useAuthStore } from "@/store/auth.store";

const ProductsPage = () => {
  const [data, setData] = useState<ProductsResponseData[]>([]);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<>();
  const {user} = useAuthStore();
  const [] = useState<boolean>(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
      try {
        const response = await request<ProductsResponseData[]>(
          "get",
          "/products/",
        );
        setData(response);

      } catch (error) {
        const errorConfigured = error as CustomApiError;
        if (errorConfigured.isNetworkError) {
          setError(
            errorConfigured.message || "Error de conexion con el servidor",
          );
        }
        if (errorConfigured.status === 401) {
          setError(
            errorConfigured.message ||
              "su sesion a expirado, vuelva a logearse denuevo",
          );
        }
        if (errorConfigured.status === 403) {
          setError(
            errorConfigured.message ||
              "No tiene permiso de administrador para esta accion",
          );
        }
      }
    };
};

export default ProductsPage;
