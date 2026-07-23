import { request } from "@/api/request.config";
import type {
  ProductsResponseData,
  CustomApiError,
  CreateProduct,
  FormattingProduct,
} from "@/types/typos.bd";
import { useMemo, useState } from "react";
import DinamycForm from "@/app/components/ui/form/DinamycForm";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import type { AxiosResponse } from "axios";

const initialProductValues: CreateProduct = {
  name: "",
  bars_code: "",
  lote: "",
  expiration_date: "",
  unity_price: 0,
  limit_minor_adquirition: 5,
  minorsale_price: 0,
  wholesale_price: 0,
  current_stock: 5,
  minimun_stock: 5,
  active: true,
};

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<ProductsResponseData[], CustomApiError>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await request("get", "/products/");
      return Array.isArray(res) ? res : ((res as AxiosResponse).data ?? []);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const [formData, setFormData] = useState<CreateProduct>(initialProductValues);
  const { user } = useAuthStore();
  const [active, setActive] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [handleModal, setHandleModal] = useState<
    "view" | "edit" | "increase_stock"
  >("view");

  const clearFields = () => {
    setFormData(initialProductValues);
    setIsEditing(false);
    setEditingId(null);
    setHandleModal("view");
    setActive(false);
  };

  const createProductHandler = useMutation<
    unknown,
    CustomApiError,
    CreateProduct
  >({
    mutationFn: (newProduct) => request("post", "/products/create", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexion con el servidor, intentelo mas tarde");
      } else if (error.status === 401) {
        setFormError("su sesion a expirado, intente iniciar sesion");
      } else if (error.status === 403) {
        setFormError("no estas permitido para realizar esta accion");
      } else {
        setFormError(error.message);
      }
    },
  });

  const updateProductHandler = useMutation<
    unknown,
    CustomApiError,
    { id: string; data: CreateProduct }
  >({
    mutationFn: ({ id, data }) =>
      request("put", `/products/update/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexion con el servidor, intentelo mas tarde");
      } else if (error.status === 401) {
        setFormError("su sesion a expirado, intente iniciar sesion");
      } else if (error.status === 403) {
        setFormError("no estas permitido para realizar esta accion");
      } else {
        setFormError(error.message);
      }
    },
  });

  const increaseStockHandler = useMutation<
    unknown,
    CustomApiError,
    { id: string; newStock: number }
  >({
    mutationFn: ({ id, newStock }) =>
      request("put", `/products/updateStock/${id}`, { newStock: newStock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexion con el servidor, intentelo mas tarde");
      } else if (error.status === 401) {
        setFormError("su sesion a expirado, intente iniciar sesion");
      } else if (error.status === 403) {
        setFormError("no estas permitido para realizar esta accion");
      } else {
        setFormError(error.message);
      }
    },
  });

  const deleteProductHandler = useMutation<
    unknown,
    CustomApiError,
    { id: string }
  >({
    mutationFn: ({ id }) => request("delete", `/products/delete/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexion con el servidor, intentelo mas tarde");
      } else if (error.status === 401) {
        setFormError("su sesion a expirado, intente iniciar sesion");
      } else if (error.status === 403) {
        setFormError("no estas permitido para realizar esta accion");
      } else {
        setFormError(error.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (handleModal === "view") return;

    if (editingId && handleModal === "increase_stock") {
      if ((formData.current_stock ?? 0) <= 0) {
        setFormError("El valor a incrementar debe ser mayor a 0");
        return;
      }
      increaseStockHandler.mutate({
        id: editingId,
        newStock: formData.current_stock ?? 0,
      });
      return;
    }

    //  Quitamos el new Date().toISOString() y pasamos la fecha limpia
    const formEnhanced = {
      ...formData,
      expiration_date: formData.expiration_date ? formData.expiration_date : "",
    };

    if (editingId && (handleModal === "edit" || isEditing)) {
      updateProductHandler.mutate({ id: editingId, data: formEnhanced });
    } else {
      createProductHandler.mutate(formEnhanced);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.bars_code.toLowerCase().includes(query),
    );
  }, [products, search]);

  const handleOpenModal = (
    product: ProductsResponseData,
    mode: "view" | "edit" | "increase_stock",
  ) => {
    setEditingId(product.id);
    setHandleModal(mode);

    if (mode === "view" || mode === "edit") {
      if (mode === "edit") setIsEditing(true);

      const formatted: FormattingProduct = product;

      setFormData({
        ...formatted,
        expiration_date: product.expiration_date
          ? product.expiration_date.split("T")[0]
          : "",
      });
    }
    if (mode === "increase_stock") {
      setFormData({
        ...initialProductValues,
        name: product.name,
        current_stock: 0,
      });
    }
  };

  const isActionPending = {
    isCreate: createProductHandler.isPending,
    isUpdate: updateProductHandler.isPending,
    message: createProductHandler.isPending
      ? "la creacion de un producto esta tomando mucho tiempo, por favor espere o recargue la pagina"
      : "la actualizacion de un producto esta tomando mucho tiempo, por favor espere o recargue la pagina",
  };

  if (isLoading) {
    return (
      <div className="">
        <p className="">cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      {isError && formError.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 
          animate-fade-in-form-modal duration-200"
        >
          <div className="relative w-full max-w-md bg-color-bg-danger p-6 rounded-2xl shadow-blur-for-shadows">
            <button
              type="button"
              onClick={() => setFormError("")}
              className="text-color-text-danger hover:text-color-text-button transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-square-xmark text-xl" />
            </button>
            <div className="pr-6">
              <p className="text-lg font-bold text-color-text-danger leading-snug">
                {formError}
              </p>
            </div>
          </div>
        </div>
      )}
      {editingId && (
        <>
          {/* OVERLAY DE FONDO CON BLUR */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)",
            }}
            onClick={clearFields}
          />

          {/* CONTENEDOR PRINCIPAL DEL MODAL */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden border transition-all pointer-events-auto"
              style={{
                backgroundColor: "var(--color-background-dinamyc-general)",
                borderColor: "var(--color-border-card)",
                boxShadow: "var(--shadow-blur-for-shadows)",
              }}
            >
              {/* CABECERA DINÁMICA DEL MODAL */}
              <div
                className="flex items-center gap-3 px-6 py-4 border-b transition-colors"
                style={{
                  borderColor: "var(--color-border-card)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {handleModal === "increase_stock" && (
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: "var(--color-background-emojis-color)",
                    }}
                  >
                    <i
                      className="fa-solid fa-angles-up text-lg"
                      style={{ color: "var(--color-text-warning)" }}
                    />
                  </div>
                )}
                {handleModal === "edit" && (
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: "var(--color-background-buttons)",
                    }}
                  >
                    <i
                      className="fa-solid fa-pen-to-square text-lg"
                      style={{ color: "var(--color-text-general)" }}
                    />
                  </div>
                )}
                {handleModal === "view" && (
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "var(--color-background-dark)" }}
                  >
                    <i
                      className="fa-solid fa-eye text-lg"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </div>
                )}

                <h3
                  className="text-lg font-bold flex-1"
                  style={{ color: "var(--color-text-general)" }}
                >
                  {handleModal === "view" &&
                    `Detalles de: ${formData.name || "Producto"}`}
                  {handleModal === "edit" && `Modificar Producto`}
                  {handleModal === "increase_stock" && `Abastecer Inventario`}
                </h3>

                {/* Botón de cerrar X */}
                <button
                  type="button"
                  onClick={clearFields}
                  className="text-2xl font-medium p-1 hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✕
                </button>
              </div>

              {/* CUERPO DEL FORMULARIO CON SCROLL INTERNO SI ES NECESARIO */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-5"
              >
                {/* Banner de errores si la mutación falla */}
                {formError && (
                  <div
                    className="p-3.5 rounded-lg border text-sm font-medium flex items-center gap-2 animate-shake"
                    style={{
                      backgroundColor:
                        "var(--color-background-emojis-color-alert)",
                      borderColor: "var(--color-bg-danger)",
                      color: "var(--color-text-danger)",
                    }}
                  >
                    <i className="fa-solid fa-circle-exclamation" /> {formError}
                  </div>
                )}

                {/* FLUJO A: RENDERIZADO EXCLUSIVO PARA INCREMENTAR STOCK */}
                {handleModal === "increase_stock" ? (
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: "var(--color-background-dark)",
                        borderColor: "var(--color-border-card)",
                      }}
                    >
                      <span
                        className="text-xs font-semibold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Producto Seleccionado
                      </span>
                      <p
                        className="text-base font-bold"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        {formData.name}
                      </p>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Cantidad a añadir al Stock Actual
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.current_stock || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              current_stock: Number(e.target.value),
                            })
                          }
                          placeholder="Ej. 50"
                          className="w-full px-4 py-3 rounded-lg text-sm border outline-none font-mono font-semibold transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          UNIDADES
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* FLUJO B: MAQUETA DE CAMPOS CON CSS GRID PARA VER Y EDITAR */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    {/* 1. Nombre */}
                    <div className="sm:col-span-2">
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Nombre del Producto
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-general)",
                          }}
                        >
                          {formData.name || "—"}
                        </div>
                      ) : (
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all font-medium focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 2. Código de Barras */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Código de Barras
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formData.bars_code || "—"}
                        </div>
                      ) : (
                        <input
                          type="text"
                          required
                          value={formData.bars_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bars_code: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none font-mono transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 3. Lote */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Lote
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formData.lote || "Sin lote asignado"}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.lote || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, lote: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 4. Fecha de Expiración */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Fecha de Vencimiento
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formData.expiration_date
                            ? Intl.DateTimeFormat("es-PE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                timeZone: "UTC",
                              }).format(new Date(formData.expiration_date))
                            : "—"}
                        </div>
                      ) : (
                        <input
                          type="date"
                          required
                          value={formData.expiration_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expiration_date: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none font-mono transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 5. Precio Unitario */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Precio Unitario
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          S/ {Number(formData.unity_price).toFixed(2)}
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={Number(formData.unity_price).toFixed(2)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              unity_price: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none font-mono transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 6. Límite de Adquisición */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Límite Adquisición Menor
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formData.limit_minor_adquirition ?? "5"} unidades
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={formData.limit_minor_adquirition}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limit_minor_adquirition: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 7. Precio al por Menor */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Precio Venta Menor
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          S/ {Number(formData.minorsale_price).toFixed(2)}
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={Number(formData.minorsale_price).toFixed(2)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minorsale_price: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none font-mono transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 8. Precio al por Mayor */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Precio Venta Mayor
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          S/ {Number(formData.wholesale_price).toFixed(2)}
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={Number(formData.wholesale_price).toFixed(2)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              wholesale_price: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none font-mono transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 9. Stock Actual */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Stock Actual
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formData.current_stock} unidades
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={formData.current_stock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              current_stock: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>

                    {/* 10. Stock Mínimo */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-general)" }}
                      >
                        Stock Mínimo
                      </label>
                      {handleModal === "view" ? (
                        <div
                          className="w-full px-3 py-2.5 rounded-lg text-sm border"
                          style={{
                            backgroundColor: "var(--color-background-dark)",
                            borderColor: "var(--color-border-card)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formData.minimun_stock} unidades
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={formData.minimun_stock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minimun_stock: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all focus:ring-2"
                          style={{
                            backgroundColor:
                              "var(--color-background-dinamyc-general)",
                            borderColor: "var(--color-border-input)",
                            color: "var(--color-text-general)",
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </form>

              {/* FOOTER CON ACCIONES */}
              <div
                className="flex items-center justify-end gap-3 px-6 py-4 border-t"
                style={{
                  borderColor: "var(--color-border-card)",
                  backgroundColor: "var(--color-background-dark)",
                }}
              >
                <button
                  type="button"
                  onClick={clearFields}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor:
                      "var(--color-background-emojis-color-alert)",
                    color: "var(--color-text-danger)",
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                  Cancelar
                </button>

                {handleModal === "view" && user?.rol === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setHandleModal("edit");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80 cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-background-buttons)",
                      color: "var(--color-text-general)",
                    }}
                  >
                    <i className="fa-solid fa-pen-to-square" />
                    Editar
                  </button>
                )}

                {handleModal !== "view" && (
                  <button
                    type="submit"
                    disabled={
                      isActionPending.isCreate ||
                      isActionPending.isUpdate ||
                      increaseStockHandler.isPending
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-bg-success)",
                      color: "white",
                    }}
                    aria-label={
                      isActionPending.isCreate || isActionPending.isUpdate
                        ? isActionPending.message
                        : increaseStockHandler.isPending
                          ? "la accion de incrementar stock esta tomando mas tiempo, espere por favor"
                          : "guardar cambios"
                    }
                  >
                    <i className="fa-solid fa-check" />
                    Guardar
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-color-text-general">
            Gestión de Productos
          </h1>
          <p className="text-sm mt-0.5 text-color-text-muted">
            {products.length} productos registrados
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setEditingId(null);
            setFormData(initialProductValues);
            setHandleModal("edit");
            setActive(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90
          bg-background-buttons text-color-text-button cursor-pointer"
        >
          <i className="fa-solid fa-plus text-lg" /> Nuevo Producto
        </button>
      </div>
      <div className="relative max-w-sm">
        <i
          className="fa-solid fa-magnifying-glass text-lg absolute left-3 top-1/2 -translate-y-1/2
        text-color-text-muted"
        />
        <input
          type="text"
          aria-label="buscar"
          value={search}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
          ) => setSearch(e.target.value)}
          placeholder="buscar por nombre o codigo"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none bg-background-dark
          border-color-border-input text-color-text-general"
        />
      </div>
      <div className="rounded-xl border overflow-hidden bg-background-dark border-color-border-card">
        <div
          className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 bg-background-buttons backdrop-blur-sm
        p-4 text-color-text-button border-b border-color-border-card font-semibold text-sm"
        >
          <div className="text-center">Producto</div>
          <div className="text-center">Código</div>
          <div className="text-center">P. menor</div>
          <div className="text-center">Stock</div>
          <div className="text-center">Fechas</div>
          <div className="text-center">Acciones</div>
        </div>
        <div className="divide-y divide-color-border-card">
          {filteredProducts.length === 0 ? (
            <div className="text-center p-8 text-sm text-color-text-muted">
              No se encontraron productos
            </div>
          ) : (
            filteredProducts.map((p) => {
              const lowStock =
                p.current_stock !== undefined &&
                p.minimun_stock !== undefined &&
                p.current_stock <= p.minimun_stock;
              return (
                <div
                  className="grid grid-cols-6 gap-4 p-4 items-center 
                  hover:bg-background-buttons/20 transition-all text-sm"
                  key={p.id}
                >
                  <div className="flex items-center gap-2 truncate">
                    {lowStock && (
                      <span className="text-color-text-warning">
                        <i className="fa-solid fa-triangle-exclamation" />
                      </span>
                    )}
                    <span className="font-medium text-color-text-general truncate">
                      {p.name}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-color-text-muted">
                    {p.bars_code}
                  </div>

                  <div className="font-mono text-color-text-general">
                    S/.{Number(p.minorsale_price).toFixed(2)}
                  </div>

                  <div
                    className={`font-mono font-semibold ${lowStock ? "text-color-text-danger" : "text-color-text-general"}`}
                  >
                    {p.current_stock ?? "-"}
                  </div>

                  <div className="flex justify-center items-center gap-10 font-mono text-color-text-general">
                    <p className="font-mono">
                      <i className="fa-solid fa-calendar-plus" />{" "}
                      {Intl.DateTimeFormat("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        timeZone: "UTC",
                      }).format(new Date(p.createdAt))}
                    </p>
                    <p className="font-mono">
                      <i className="fa-solid fa-pen-nib" />{" "}
                      {Intl.DateTimeFormat("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        timeZone: "UTC",
                      }).format(new Date(p.updatedAt))}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <button
                      type="button"
                      title="ver mas"
                      onClick={() => handleOpenModal(p, "view")}
                      className="text-color-text-button hover:text-color-primary transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-ellipsis text-lg" />
                    </button>
                    <button
                      type="button"
                      title="incrementar stock"
                      onClick={() => handleOpenModal(p, "increase_stock")}
                      className="text-color-text-button hover:text-color-primary transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-angles-up text-lg" />
                      stock
                    </button>
                    {user?.rol === "ADMIN" && (
                      <button
                        type="button"
                        title="eliminar producto"
                        onClick={() =>
                          {
                            setHandleModal("edit")
                            deleteProductHandler.mutate({ id: p.id })
                          }
                        }
                        className="text-color-text-danger hover:text-color-bg-danger transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-lg" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <DinamycForm
        isOpen={active}
        setIsOpen={setActive}
        title="Crear Producto"
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="font-medium">
              <label className="block text-sm text-color-text-general mb-1">
                Nombre *
              </label>
              <input
                type="text"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                value={formData.name}
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-color-text-general mb-1">
                Codigo de Barras
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={formData.bars_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bars_code: e.target.value,
                  })
                }
                type="text"
                placeholder="codigo de barra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Lote
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={formData.lote ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lote: e.target.value,
                  })
                }
                type="text"
                placeholder="lote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Fecha de expiracion
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiration_date: e.target.value,
                  })
                }
                type="date"
                placeholder="formato (YY/MM/DD)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Precio Unitario
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={Number(formData.unity_price).toFixed(2)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unity_price: Number(e.target.value),
                  })
                }
                type="number"
                placeholder="ingrese precio unitario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                limite de adquisicion por menor (opcional)
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={formData.limit_minor_adquirition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limit_minor_adquirition: Number(e.target.value),
                  })
                }
                type="number"
                placeholder="ingrese limite de adquisicion de producto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Precio al por Menor
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={Number(formData.minorsale_price).toFixed(2)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minorsale_price: Number(e.target.value),
                  })
                }
                type="number"
                placeholder="ingrese el precio al por menor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Precio al por Mayor
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={Number(formData.wholesale_price).toFixed(2)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wholesale_price: Number(e.target.value),
                  })
                }
                type="number"
                placeholder="ingrese el precio al por mayor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Stock Actual (opcional)
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={formData.current_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_stock: Number(e.target.value),
                  })
                }
                type="number"
                placeholder="ingrese stock actual (esto no incrementa el stock)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text-general mb-1">
                Stock Minimo (opcional)
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-color-border-focus text-color-text-button hover:border-color-primary focus:border-color-primary"
                value={formData.minimun_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimun_stock: Number(e.target.value),
                  })
                }
                type="number"
                placeholder="ingrese un minimo para diferenciar el stock (esto no incrementa el stock)"
              />
            </div>
          </div>
          <div className="flex justify-evenly">
            <button
              type="submit"
              className="px-4 py-2 border text-color-text-button rounded-lg bg-background-buttons hover:bg-background-buttons/80 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-floppy-disk text-lg" />
              Guardar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-color-text-danger hover:text-color-bg-danger transition-colors cursor-pointer"
              onClick={() => setActive(false)}
            >
              <i className="fa-solid fa-ban text-lg" />
              Cancelar
            </button>
          </div>
        </form>
      </DinamycForm>
    </div>
  );
};

export default ProductsPage;
