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
          setError(
            errorConfigured.message ||
              "Ha ocurrido un error inesperado al cargar los datos.",
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDataConditionally();
  }, [user, navigate]);

  const Kpis: KpisInterface[] = [
    {
      label: "Total de productos",
      value: String(productsAlert?.alerts ?? 0),
      icon: "fa-solid fa-cube",
      color: "text-background-emojis-color-alert",
    },
    {
      label: "Valor total del inventario",
      value: String(adminData?.totalInventoryValue ?? 0),
      icon: "fa-solid fa-dollar-sign",
      color: "text-background-emojis-color",
    },
    {
      label: "Ventas de Hoy",
      value: String(adminData?.sellsToday ?? 0),
      icon: "fa-solid fa-bag-shopping",
      color: "text-green-700",
    },
    {
      label: "Total de Usuarios",
      value: String(adminData?.usersTotal ?? 0),
      icon: "fa-solid fa-people-group",
      color: "text-purple-700",
    },
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
      {error.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 
                    animate-fade-in-form-modal duration-200"
        >
          <div className="relative w-full max-w-md bg-background-emojis-color-alert p-6 rounded-2xl shadow-blur-for-shadows">
            <button
              className="absolute top-4 right-4 text-color-text-button hover:bg-color-text-button/40 
                            animate-fade-out-form-modal p-1.5 rounded-lg transition-colors flex items-center justify-center"
              aria-label="cerrar"
              type="button"
              onClick={() => setError("")}
            >
              <i className="fa-solid fa-square-xmark text-xl" />
            </button>
            <div className="pr-6">
              <p className="text-lg font-bold text-color-text-general leading-snug">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold text-color-text-general/50">
          Dashboard
        </h1>
        <p className="text-sm mt-0.5 text-color-text-general/75">
          Resumen de operaciones -{" "}
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      {user?.rol === "ADMIN" && (
        <div>
          {Kpis.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="rounded-xl p-5 border bg-background-dinamyc-general/35 border-background-buttons/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}`}
                >
                  <i className={icon + "size-4.5 " + color} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-color-text-general/50 font-mono">
                {value}
              </p>
              <p className="text-xs font-medium mt-2 text-color-text-general/75">
                {label}
              </p>
            </div>
          ))}
          <div className="">
            <div className="mb-4">
              <h2></h2>
              <p></p>
            </div>
            {adminData?.latest5Transactions &&
            adminData.latest5Transactions.length > 0 ? (
              <div className="">
                {adminData.latest5Transactions.map((movement) => {
                  const formattedDate = new Date(
                    movement.createdAt,
                  ).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  const formattedTime = new Date(
                    movement.createdAt,
                  ).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0
                     hover:bg-background-dinamyc-general/60 dark:hover:bg-background-dinamyc-general/20 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <i className="fa-solid fa-arrow-trend-up text-sm"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Venta #{movement.id.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-400">
                            Por:{" "}
                            <span className="font-medium">
                              {movement.user?.name || "Sistema"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          + $
                          {Number(movement.total).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formattedDate} a las {formattedTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                No se han registrado movimientos el día de hoy.
              </p>
            )}
          </div>
        </div>
      )}
      {user?.rol === "ALMACENERO" && (
        <div>
          <div
            key={Kpis[0].label}
            className="rounded-xl p-5 border bg-background-dinamyc-general/35 border-background-buttons/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${Kpis[0].color}`}
              >
                <i className={Kpis[0].icon + "size-4.5 " + Kpis[0].color} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-color-text-general/50 font-mono">
              {Kpis[0].value}
            </p>
            <p className="text-xs font-medium mt-2 text-color-text-general/75">
              {Kpis[0].label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
