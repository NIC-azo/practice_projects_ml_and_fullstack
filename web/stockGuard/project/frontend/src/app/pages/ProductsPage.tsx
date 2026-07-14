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
import { data } from "react-router-dom";

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
    error,
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
    onError: (error) => setFormError(error.message),
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
    onError: (error) => setFormError(error.message),
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
    onError: (error) => setFormError(error.message),
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
    onError: (error) => setFormError(error.message),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (editingId && handleModal === "increase_stock") {
      if ((formData.current_stock ?? 0) <= 0) {
        setFormError("El valor a incrementar debe ser mayor a 0");
        return;
      }
      increaseStockHandler.mutate({id: editingId, newStock: formData.current_stock ?? 0});
      return;
    }

    const formEnhanced = {
      ...formData,
      expiration_date:
        formData.expiration_date ??
        new Date(formData.expiration_date).toISOString(),
    };

    if (editingId && isEditing) {
      updateProductHandler.mutate({id: editingId, data: formEnhanced});
    } else {
      createProductHandler.mutate(formEnhanced)
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
    };

  };

  let isActionPending = {
    isCreate: createProductHandler.isPending,
    isUpdate: updateProductHandler.isPending,
    message: createProductHandler.isPending
      ? "la creacion de un producto esta tomando mucho tiempo, por favor espere o recargue la pagina"
      : (updateProductHandler.isPending ??
        "la actualizacion de un producto esta tomando mucho tiempo, por favor espere o recargue la pagina"),
  };

  return (
    <div className="space-y-5 font-sans">
      {isError && (
        <div>

        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-background-dinamyc-general">
            Gestión de Productos
          </h1>
          <p className="text-sm mt-0.5 text-background-dinamyc-general/70">
            {data.length} productos registrados
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
          className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-4 bg-sky-700/75 backdrop-blur-sm
        p-4 text-color-text-general border-b border-white/20 font-semibold text-sm"
        >
          <div className="text-center">Producto</div>
          <div className="text-center">Código</div>
          <div className="text-center">P. menor</div>
          <div className="text-center">Stock</div>
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

                  <div className="flex items-center justify-center gap-2">
                    <button type="button">
                      <i className="" />
                    </button>
                    <button type="button">
                      <i className="" />
                    </button>
                    {user?.rol === "ADMIN" && (
                      <button type="button">
                        <i className="" />
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
        title=""
        >
          <form action="">
            
          </form>
      </DinamycForm>
    </div>
  );
};

export default ProductsPage;
