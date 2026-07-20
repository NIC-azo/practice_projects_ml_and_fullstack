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
      return await request<ProductsResponseData[]>("get", "/products/");
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

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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

    const formEnhanced = {
      ...formData,
      expiration_date: formData.expiration_date
        ? new Date(formData.expiration_date).toISOString()
        : "",
    };

    if (editingId && (handleModal === "edit" || isEditing)) {
      updateProductHandler.mutate({ id: editingId, data: formEnhanced });
      return;
    } else {
      createProductHandler.mutate(formEnhanced);
      return;
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
          <div className="relative w-full max-w-md bg-background-emojis-color-alert p-6 rounded-2xl shadow-blur-for-shadows">
            <button type="button" onClick={() => setFormError("")}>
              <i className="fa-solid fa-square-xmark text-xl text-background-emojis-color-alert hover:text-background-emojis-color-alert/60" />
            </button>
            <div className="pr-6">
              <p className="text-lg font-bold text-color-text-general leading-snug">
                {formError}
              </p>
            </div>
          </div>
        </div>
      )}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center px-6 py-4 border-b border-gray-200 shadow-background-dark/25">
              {handleModal === "increase_stock" && (
                <>
                  <i className="fa-solid fa-angles-up bg-background-buttons/50 text-background-emojis-color" />{" "}
                  <h3 className="text-xl font-semibold text-color-text-general">
                    Incrementar Stock
                  </h3>
                </>
              )}
              {handleModal === "edit" && (
                <>
                  <i className="fa-solid fa-pen-to-square bg-background-buttons/50 text-background-emojis-color" />{" "}
                  <h3 className="text-xl font-semibold text-color-text-general">
                    Editar Producto
                  </h3>
                </>
              )}
              {handleModal === "view" && (
                <>
                  <i className="fa-solid fa-eye bg-background-buttons/50 text-background-emojis-color" />{" "}
                  <h3 className="text-xl font-semibold text-color-text-general">
                    Visualizar Datos del Producto
                  </h3>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {handleModal === "increase_stock" ? (
                <div>
                  <label className="block text-sm font-medium text-color-text-general mb-1">
                    Ingresar la cantidad de Stock
                  </label>
                  <input
                    className=""
                    type="number"
                    placeholder="ingresar enteros o decimal"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_stock: Number(e.target.value),
                      })
                    }
                    value={formData.current_stock}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Nombre
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.name}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        type="text"
                        placeholder="nombre del producto"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Codigo de Barras
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.bars_code}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Lote
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.lote}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Fecha de expiracion
                    </label>
                    {handleModal === "view" ? (
                      <p>
                        {Intl.DateTimeFormat("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(new Date(formData.expiration_date))}
                      </p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Precio Unitario
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.unity_price}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
                        value={formData.unity_price.toFixed(2)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unity_price: Number(e.target.value),
                          })
                        }
                        type="number"
                        placeholder="ingrese precio unitario"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      limite de adquisicion por menor (opcional)
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.limit_minor_adquirition ?? 0}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Precio al por Menor
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.minorsale_price}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
                        value={formData.minorsale_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minorsale_price: Number(e.target.value),
                          })
                        }
                        type="number"
                        placeholder="ingrese el precio al por menor"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Precio al por Mayor
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.wholesale_price}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
                        value={formData.wholesale_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wholesale_price: Number(e.target.value),
                          })
                        }
                        type="number"
                        placeholder="ingrese el precio al por mayor"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Stock Actual (opcional)
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.current_stock}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-text-general mb-1">
                      Stock Minimo (opcional)
                    </label>
                    {handleModal === "view" ? (
                      <p>{formData.minimun_stock}</p>
                    ) : (
                      <input
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-center gap-2">
              <button onClick={clearFields} type="button">
                <i className="fa-solid fa-rectangle-xmark text-background-emojis-color" />
                Cerrar/Cancelar
              </button>
              {handleModal === "view" && user?.rol === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setHandleModal("edit");
                  }}
                >
                  <i className="fa-solid fa-pen-to-square text-background-emojis-color" />
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
                  aria-label={
                    isActionPending.isCreate || isActionPending.isUpdate
                      ? isActionPending.message
                      : increaseStockHandler.isPending
                        ? "la accion de incrementar stock esta tomando mas tiempo, espere por favor"
                        : "una accion llevada a cabo recientemente esta tomando mas tiempo, reinicie el sistema o contacte soporte tecnico"
                  }
                >
                  <i className="fa-solid fa-circle-check text-background-emojis-color" />
                  Guardar Cambios
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-background-dinamyc-general">
            Gestión de Productos
          </h1>
          <p className="text-sm mt-0.5 text-background-dinamyc-general/70">
            {products.length} productos registrados
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setActive(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90
          bg-background-buttons text-background-buttons/50"
        >
          <i className="fa-solid fa-plus text-lg" /> Nuevo Producto
        </button>
      </div>
      <div className="relative max-w-sm">
        <i
          className="fa-solid fa-magnifying-glass text-lg absolute left-3 top-1/2 -translate-y-1/2
        text-background-dinamyc-general/70"
        />
        <input
          type="text"
          aria-label="buscar"
          value={search}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
          ) => setSearch(e.target.value)}
          placeholder="buscar por nombre o codigo"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none bg-background-dinamyc-general/35
          border-background-buttons/60 text-background-dark"
        />
      </div>
      <div className="rounded-xl border overflow-hidden bg-purple-500 border-background-buttons/40">
        <div
          className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 bg-sky-700/75 backdrop-blur-sm
        p-4 text-color-text-general border-b border-white/20 font-semibold text-sm"
        >
          <div className="text-center">Producto</div>
          <div className="text-center">Código</div>
          <div className="text-center">P. menor</div>
          <div className="text-center">Stock</div>
          <div className="text-center">Fechas</div>
          <div className="text-center">Acciones</div>
        </div>
        <div className="divide-y divide-background-emojis-color/60">
          {filteredProducts.length === 0 ? (
            <div className="text-center p-8 text-sm text-background-emojis-color/75">
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
                  className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-4 p-4 items-center 
                  hover:bg-white/5 transition-all text-sm"
                  key={p.id}
                >
                  <div className="flex items-center gap-2 truncate">
                    {lowStock && (
                      <span className="text-amber-400">
                        <i className="fa-solid fa-triangle-exclamation" />
                      </span>
                    )}
                    <span className="font-medium text-white truncate">
                      {p.name}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-background-emojis-color/75">
                    {p.bars_code}
                  </div>

                  <div className="font-mono text-color-text-general">
                    S/.{p.minorsale_price.toFixed(2)}
                  </div>

                  <div
                    className={`font-mono font-semibold ${lowStock ? "text-red-400" : "text-white"}`}
                  >
                    {p.current_stock ?? "-"}
                  </div>

                  <div className="flex items-center justify-between font-mono text-color-text-general">
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

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      aria-label="ver mas"
                      onClick={() => handleOpenModal(p, "view")}
                    >
                      <i className="fa-solid fa-ellipsis text-background-emojis-color" />
                    </button>
                    <button
                      type="button"
                      aria-label="incrementar stock"
                      onClick={() => handleOpenModal(p, "increase_stock")}
                    >
                      <i className="fa-solid fa-angles-up text-background-emojis-color" />
                      stock
                    </button>
                    {user?.rol === "ADMIN" && (
                      <button
                        type="button"
                        aria-label="eliminar producto"
                        onClick={() =>
                          deleteProductHandler.mutate({ id: p.id })
                        }
                      >
                        <i className="fa-solid fa-trash-can text-background-emojis-color-alert" />
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
                border-sky-500 text-color-text-button/80"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-color-text-general mb-1">
                Codigo de Barras
              </label>
              <input
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                                border-sky-500 text-color-text-button/80"
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
                                border-sky-500 text-color-text-button/80"
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
                                border-sky-500 text-color-text-button/80"
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
                                border-sky-500 text-color-text-button/80"
                value={formData.unity_price.toFixed(2)}
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
                                border-sky-500 text-color-text-button/80"
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
                                border-sky-500 text-color-text-button/80"
                value={formData.minorsale_price}
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
                                border-sky-500 text-color-text-button/80"
                value={formData.wholesale_price}
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
                                border-sky-500 text-color-text-button/80"
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
                                border-sky-500 text-color-text-button/80"
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
          <div className="flex justify-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 border text-background-emojis-color rounded-lg bg-background-buttons hover:bg-background-buttons/70"
            >
              <i className="fa-solid fa-floppy-disk text-lg" />
              Guardar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-background-emojis-color-alert"
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
