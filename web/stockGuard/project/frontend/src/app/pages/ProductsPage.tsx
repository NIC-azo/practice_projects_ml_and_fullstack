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

  const clearFields = () => {
    setFormData(initialProductValues);
    setIsEditing(false);
    setEditingId(null);
  };

  const createProductHandler = useMutation<unknown, CustomApiError, CreateProduct>({
    mutationFn: (newProduct) => request("post", "/products", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      clearFields();
    }
  })
};

export default ProductsPage;
