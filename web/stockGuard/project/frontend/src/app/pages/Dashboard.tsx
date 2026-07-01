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
    {
     label: 'Total de productos', value: String(productsAlert?.alerts ?? 0), icon: 'fa-solid fa-cube', 
     color: 'text-background-emojis-color-alert'
    },
    {
      label: "Valor total del inventario", value: String(adminData?.totalInventoryValue ?? 0),
      icon: "fa-solid fa-dollar-sign", color: 'text-background-emojis-color'
    },
    {
      label: 'Ventas de Hoy', value: String(adminData?.sellsToday ?? 0), icon: 'fa-solid fa-bag-shopping', 
      color: 'text-green-700'
    },
    {
      label: 'Total de Usuarios', value: String(adminData?.usersTotal ?? 0), icon: 'fa-solid fa-people-group', 
      color: 'text-purple-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-color-text-general">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-semibold text-color-text-general/50">Dashboard</h1>
        <p className="text-sm mt-0.5 text-color-text-general/75">
          Resumen de operaciones - {new Date().toLocaleDateString('es-PE', {weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <div>
        {Kpis.map(({label, value, icon, color}) => (
          <div key={label} className="rounded-xl p-5 border bg-background-dinamyc-general/35 border-background-buttons/20">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}`}>
                <i className={icon + 'size-4.5 ' + color}/>
              </div>
            </div>
            <p className="text-2xl font-semibold text-color-text-general/50 font-mono">
              {value}
            </p>
            <p className="text-xs font-medium mt-2 text-color-text-general/75">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
