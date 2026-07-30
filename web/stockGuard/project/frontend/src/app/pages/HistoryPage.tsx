/* eslint-disable @typescript-eslint/no-explicit-any */
import { request } from "@/api/request.config";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type {
  HistoryResponseData,
  CustomApiError,
  Status,
} from "@/types/typos.bd";
import type { AxiosResponse } from "axios";

type FilterType = "todos" | "usuario" | "fecha" | "status";

function HistoryPage() {
  // 1. Obtención de historial mediante TanStack Query
  const {
    data: histories = [],
    isLoading,
    isError,
    error,
  } = useQuery<HistoryResponseData[], CustomApiError>({
    queryKey: ["histories"],
    queryFn: async () => {
      const res = await request<
        HistoryResponseData[] | { data: HistoryResponseData[] }
      >("get", "/history/");
      if (Array.isArray(res)) return res;
      if (res && "data" in res && Array.isArray(res.data)) return res.data;
      return (res as AxiosResponse).data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // 2. Estados de Filtro
  const [filterType, setFilterType] = useState<FilterType>("todos");
  const [userNameSearch, setUserNameSearch] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<Status | "">("");

  // Estado para controlar qué fila está expandida con el botón '+'
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 3. Métodos individuales de Filtrado
  const getHistoryByUserName = (data: HistoryResponseData[]) => {
    if (!userNameSearch.trim()) return data;
    return data.filter((item) =>
      item.user.name
        .toLowerCase()
        .includes(userNameSearch.toLowerCase().trim()),
    );
  };

  const getHistoryByDateRange = (data: HistoryResponseData[]) => {
    if (!dateRange.startDate && !dateRange.endDate) return data;
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt).getTime();
      const start = dateRange.startDate
        ? new Date(dateRange.startDate).getTime()
        : 0;
      const end = dateRange.endDate
        ? new Date(`${dateRange.endDate}T23:59:59`).getTime()
        : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  };

  const getHistoryByStatus = (data: HistoryResponseData[]) => {
    if (!selectedStatus) return data;
    return data.filter((item) => item.status === selectedStatus);
  };

  // 4. Método Padre de Filtrado con Condicionales Estrictos
  const filterHistories = (): HistoryResponseData[] => {
    if (filterType === "usuario" && userNameSearch.trim() !== "") {
      return getHistoryByUserName(histories);
    }
    if (
      filterType === "fecha" &&
      (dateRange.startDate !== "" || dateRange.endDate !== "")
    ) {
      return getHistoryByDateRange(histories);
    }
    if (filterType === "status" && selectedStatus !== "") {
      return getHistoryByStatus(histories);
    }
    return histories;
  };

  // Limpiar campos secundarios al cambiar la opción del Selector Principal
  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as FilterType;
    setFilterType(val);
    setUserNameSearch("");
    setDateRange({ startDate: "", endDate: "" });
    setSelectedStatus("");
  };

  const filteredData = filterHistories();

  // Helper para convertir Decimal / Numbers de manera segura
  const formatTotal = (total: any): string => {
    if (typeof total === "number") return total.toFixed(2);
    if (total && typeof total === "object" && "valueOf" in total) {
      return Number(total.valueOf()).toFixed(2);
    }
    return Number(total ?? 0).toFixed(2);
  };

  // Helper para renderizar badges de status usando clases de themes.css
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "CANCELADO":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-color-bg-success text-color-text-success">
            CANCELADO
          </span>
        );
      case "EN_PROCESO":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-color-bg-warning text-color-text-warning">
            EN PROCESO
          </span>
        );
      case "ANULADO":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-color-bg-danger text-color-text-danger">
            ANULADO
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-background-dinamyc-general text-color-text-general">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold leading-tight">
          Historial de Transacciones
        </h1>
        <p className="text-sm text-color-text-muted mt-1">
          Consulta y filtra los movimientos de ventas realizados en el sistema
        </p>
      </div>

      {/* Panel de Controles de Filtro */}
      <div className="p-5 rounded-2xl border border-color-border-card bg-color-bg-secondary shadow-card flex flex-col md:flex-row gap-4 items-start md:items-end">
        {/* Selector del Criterio de Filtro */}
        <div className="flex flex-col gap-1.5 w-full md:w-64">
          <label className="text-xs font-semibold text-color-text-secondary">
            Filtrar por
          </label>
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-color-border-input bg-background-dinamyc-general text-color-text-general outline-none focus:border-color-border-focus"
          >
            <option value="todos">Todos los registros</option>
            <option value="usuario">Usuario</option>
            <option value="fecha">Fecha</option>
            <option value="status">Tipo de movimiento (Status)</option>
          </select>
        </div>

        {/* Renderizado Condicional según la opción seleccionada */}
        <div className="flex-1 w-full">
          {/* Opción: Usuario */}
          {filterType === "usuario" && (
            <div className="flex flex-col gap-1.5 w-full md:max-w-md">
              <input
                type="text"
                value={userNameSearch}
                onChange={(e) => setUserNameSearch(e.target.value)}
                placeholder="Ingresa el nombre de usuario a buscar..."
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-color-border-input bg-background-dinamyc-general text-color-text-general outline-none focus:border-color-border-focus"
              />
            </div>
          )}

          {/* Opción: Fecha */}
          {filterType === "fecha" && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-xs font-medium text-color-text-muted">
                  Fecha de inicio
                </p>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-color-border-input bg-background-dinamyc-general text-color-text-general outline-none focus:border-color-border-focus"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-xs font-medium text-color-text-muted">
                  Fecha final
                </p>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-color-border-input bg-background-dinamyc-general text-color-text-general outline-none focus:border-color-border-focus"
                />
              </div>
            </div>
          )}

          {/* Opción: Tipo de Movimiento (Status) */}
          {filterType === "status" && (
            <div className="flex flex-col gap-1.5 w-full md:max-w-xs">
              <p className="text-xs font-medium text-color-text-muted">
                Tipo de movimiento
              </p>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Status)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-color-border-input bg-background-dinamyc-general text-color-text-general outline-none focus:border-color-border-focus"
              >
                <option value="">-- Seleccionar Status --</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="EN_PROCESO">EN_PROCESO</option>
                <option value="ANULADO">ANULADO</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Estados de Carga / Error */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-color-primary" />
          <span className="ml-3 text-sm text-color-text-muted">
            Cargando historial...
          </span>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-background-emojis-color-alert border border-color-border-danger text-color-text-danger text-sm">
          {error?.message ||
            "Ocurrió un error al cargar los datos del historial."}
        </div>
      )}

      {/* Tabla de Registros */}
      {!isLoading && !isError && (
        <div className="rounded-2xl border border-color-border-card bg-background-dinamyc-general shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-color-border-card bg-color-bg-secondary text-color-text-secondary">
                  <th className="py-3.5 px-4 font-semibold">Detalles</th>
                  <th className="py-3.5 px-4 font-semibold">Fecha</th>
                  <th className="py-3.5 px-4 font-semibold">Usuario</th>
                  <th className="py-3.5 px-4 font-semibold">Cliente</th>
                  <th className="py-3.5 px-4 font-semibold">Comprobante</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-color-border-card">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-color-text-muted"
                    >
                      No se encontraron registros de historial para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const itemsDetails =
                      item.detail || (item as any).detail || [];

                    return (
                      <>
                        <tr
                          key={idx}
                          className="hover:bg-color-bg-secondary/50 transition-colors"
                        >
                          {/* Botón '+' / '-' */}
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedIndex(isExpanded ? null : idx)
                              }
                              className="w-7 h-7 rounded-lg bg-color-bg-secondary hover:bg-color-bg-tertiary border border-color-border-card flex items-center justify-center transition-colors cursor-pointer text-color-text-general font-bold"
                            >
                              {isExpanded ? "−" : "+"}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-color-text-muted font-mono text-xs">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-color-text-general">
                            {item.user.name}{" "}
                            <span className="text-xs text-color-text-muted">
                              ({item.user.rol})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-color-text-secondary">
                            {item.client.name}
                          </td>
                          <td className="py-3 px-4 text-color-text-muted font-mono text-xs">
                            {item.voucher}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold font-mono text-color-text-general">
                            S/. {formatTotal(item.total)}
                          </td>
                        </tr>

                        {/* Fila Desplegable con los Detalles (+ Button) */}
                        {isExpanded && (
                          <tr className="bg-color-bg-secondary/30">
                            <td colSpan={7} className="p-4">
                              <div className="p-4 rounded-xl border border-color-border-card bg-background-dinamyc-general space-y-3">
                                <h4 className="text-xs font-semibold text-color-text-muted uppercase tracking-wider">
                                  Productos en esta transacción
                                </h4>
                                <div className="divide-y divide-color-border-card">
                                  {itemsDetails.map(
                                    (det: any, detIdx: number) => (
                                      <div
                                        key={detIdx}
                                        className="py-2 flex items-center justify-between text-xs"
                                      >
                                        <span className="font-medium text-color-text-general">
                                          {det.product?.name ||
                                            "Producto sin nombre"}
                                        </span>
                                        <span className="text-color-text-muted font-mono">
                                          {det.quantity} x S/.{" "}
                                          {formatTotal(det.actual_price)}
                                        </span>
                                        <span className="font-semibold text-color-text-general font-mono">
                                          S/.{" "}
                                          {(
                                            det.quantity *
                                            Number(det.actual_price)
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
