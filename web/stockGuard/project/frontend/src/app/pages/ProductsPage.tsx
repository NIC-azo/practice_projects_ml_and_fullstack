import { request } from "@/api/request.config";
import type {
  ProductsResponseData,
  CustomApiError,
  CreateProduct,
} from "@/types/typos.bd";
import { useState } from "react";
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

  const clearFields = () => {
    setFormData(initialProductValues);
    setIsEditing(false);
    setEditingId(null);
  };

  const createProductHandler = useMutation<unknown, CustomApiError, CreateProduct>({
    mutationFn: (newProduct) => request("post", "/create", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      clearFields();
    },
    onError: (error) => setFormError(error.message),
  });

  const updateProductHandler = useMutation<unknown, CustomApiError, {id: string; data: CreateProduct}>({
    mutationFn: ({id, data}) => request("put", `/update/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      clearFields();
    },
    onError: (error) => setFormError(error.message),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const formEnhanced = {
      ...formData,
      expiration_date: formData.expiration_date 
      ?? new Date(formData.expiration_date).toISOString()
    }

    if (editingId && isEditing) {
      updateProductHandler.mutate({id: editingId, data: formEnhanced});
    } else {
      createProductHandler.mutate(formEnhanced);
    }
  };

  const handleEditClick = (product: CreateProduct & {id: string}) => {
    setIsEditing(true);
    setEditingId(product.id);
    setFormData({
      ...product,
      expiration_date: product.expiration_date
      ? product.expiration_date.split("T")[0]
      : ""
    });
  };

  let isActionPending = {
    isCreate: createProductHandler.isPending,
    isUpdate: updateProductHandler.isPending,
    message: createProductHandler.isPending 
    ? "la creacion de un producto esta tomando mucho tiempo, por favor espere o recargue la pagina" 
    : "la actualizacion de un producto esta tomando mucho tiempo, por favor espere o recargue la pagina"
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-background-dinamyc-general">Gestión de Productos</h1>
          <p className="text-sm mt-0.5 text-background-dinamyc-general/70">{data.length} productos registrados</p>
        </div>
        <button
          type="button"
          onClick={() => {setIsEditing(false); setActive(true)}}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90
          bg-background-buttons text-background-buttons/50"
          >
          <i className="fa-solid fa-plus text-lg"/> Nuevo Producto
        </button>
      </div>
      <div className="relative max-w-sm">
        <i className="fa-solid fa-magnifying-glass text-lg absolute left-3 top-1/2 -translate-y-1/2
        text-background-dinamyc-general/70"/>
        <input 
          type="text" aria-label="buscar" 
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="buscar por nombre o codigo"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none bg-background-dinamyc-general/35
          border-background-buttons/60 text-background-dark"
          />
      </div>
      <div className="rounded-xl border overflow-hidden bg-purple-500 border-background-buttons/40">
        <div className="grid ">
          
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
