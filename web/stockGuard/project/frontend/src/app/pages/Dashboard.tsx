import { useState, useEffect } from "react";
import { request } from "@/api/request.config";
import { useNavigate } from "react-router-dom";
import type {
  AdminDataReportsResponse,
  CustomApiError,
  KpisInterface,
  ProductsAlertResponse,
} from "@/types/typos.bd";
import { useAuthStore } from "@/store/auth.store";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<AdminDataReportsResponse>();
  const [productsAlert, setProductsAlert] = useState<ProductsAlertResponse>();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDataConditionally = async () => {
      try {
        setLoading(true);
        if (user?.rol === "ALMACENERO") {
          const productsDataFetched = await request<ProductsAlertResponse>(
            "get",
            "/dashboard/alerts",
          );
          setProductsAlert(productsDataFetched);
        } else if (user?.rol === "ADMIN") {
          const responseProducts = await request<ProductsAlertResponse>(
            "get",
            "/dashboard/alerts",
          );
          const responseAdminData = await request<AdminDataReportsResponse>(
            "get",
            "/dashboard/reportsData",
          );
          setProductsAlert(responseProducts);
          setAdminData(responseAdminData);
        }
      } catch (error) {
        const errorConfigured = error as CustomApiError;
        if (errorConfigured.isNetworkError) {
          setError(
            "Error al conectarse con el servidor, intentelo denuevo mas tarde",
          );
        }
        if (errorConfigured.status === 401) {
          setError(
            errorConfigured.message ||
              "su sesion a expirado, vuelva a logearse denuevo",
          );
          navigate("/login");
        }
        if (errorConfigured.status === 403) {
          setError(
            errorConfigured.message ||
              "No tiene permiso de administrador para esta accion",
          );
        } else {
          setError(errorConfigured.message || "Ha ocurrido un error inesperado al cargar los datos.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDataConditionally();
  }, [user, navigate]);

  const Kpis: KpisInterface[] = [
    {label: 'Total de productos', value: String(productsAlert?.alerts ?? 0), 
    sub: `${productsAlert?.alerts} producto${productsAlert?.alerts === 1 && 's'} menos`,
    up: false, icon: 'fa-solid fa-cube', color: ''
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-color-text-general">
        Cargando dashboard...
      </div>
    );
  }

  return <div></div>;
};
