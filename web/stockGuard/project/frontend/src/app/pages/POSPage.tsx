import { request } from "@/api/request.config";
import {
  useQuery,
  useQueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ProductsResponseData,
  BeginInitSell,
  CartItem,
  ClientsResponseData,
  CustomApiError,
  ClientsManagement,
  CreateProduct,
  VoucherType,
} from "@/types/typos.bd";
import DinamycForm from "@/app/components/ui/form/DinamycForm";
import { useMemo, useState } from "react";

/**
 * para obtener precio total calculando si la
 * cantidad seleccionada es mayor o igual que el limite
 * para calcular automaticamente el precio obteniendo el minor o whole precio
 */
function getItemPrice(
  product: CreateProduct & { id: string },
  quantity: number,
): number {
  const limit = product.limit_minor_adquirition ?? 5;
  const wholesale = Number(product.wholesale_price);
  const minor = Number(product.minorsale_price);
  return quantity >= limit ? wholesale : minor;
}

function POSPage() {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery<ProductsResponseData[], CustomApiError>({
    queryKey: ["products"],
    queryFn: async () => {
      return await request("get", "/products/");
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    isError: isErrorclients,
  } = useQuery<ClientsResponseData[], CustomApiError>({
    queryKey: ["clients"],
    queryFn: async () => {
      return await request("get", "/clients/");
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const beginSellMutation = useMutation<unknown, CustomApiError, BeginInitSell>(
    {
      mutationFn: (payload) => request("post", "/sells/create", payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
      onError: (error) => {
        if (error.isNetworkError) {
          setErrorMessage(
            "Error de conexion con el servidor, intentelo mas tarde",
          );
        } else if (error.status === 401) {
          setErrorMessage("su sesion a expirado, intente iniciar sesion");
        } else if (error.status === 403) {
          setErrorMessage("no estas permitido para realizar esta accion");
        } else {
          setErrorMessage(error.message);
        }
      },
    },
  );
  const [productsSearch, setProductsSearch] = useState<string>("");
  const [clientsSearch, setClientsSearch] = useState<string>("");
  const [cart, setCart] = useState<CartItem[] | null>(null);
  const [clientSelected, setClientSelected] = useState<
    (ClientsManagement & { id: string }) | null
  >(null);
  const [voucherType, setVoucherType] = useState<VoucherType>("BOLETA");
  const [clientDropOpen, setclientDropOpen] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(productsSearch.toLowerCase()) ||
        p.bars_code.includes(productsSearch),
    );
  }, [products, productsSearch]);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(clientsSearch.toLowerCase()) ||
        (c.dni && c.dni.includes(clientsSearch)) ||
        (c.ruc && c.ruc.includes(clientsSearch)),
    );
  }, [clients, clientsSearch]);

  const addToCart = (product: CreateProduct & { id: string }) => {
    setCart((prev) => {
      if (!prev) {
        if ((product.current_stock ?? 0) < 1) {
          setErrorMessage("stock del producto insuficiente del almacen");
          return prev;
        }
        return [{ product, quantity: 1 }];
      }

      const existing = prev.find((i) => i.product.id === product.id);
      const currentProductQuantity = existing ? existing.quantity : 0;

      if (currentProductQuantity + 1 > (product.current_stock ?? 0)) {
        setErrorMessage("stock del producto insuficiente del almacen");
        return prev;
      }
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    const item = cart?.find((i) => i.product.id === productId);
    if (item && quantity > (item.quantity ?? 0)) {
      setErrorMessage("stock maximo alcanzado");
      return;
    }
    setCart((prev) => {
      if (!prev) {
        setErrorMessage("No se encontro el item en el carrito");
        return prev;
      }
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: quantity } : i,
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      if (!prev) {
        setErrorMessage("No se encontro el item en el carrito");
        return prev;
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const total =
    cart?.reduce(
      (sum, item) =>
        sum + getItemPrice(item.product, item.quantity) * item.quantity,
      0,
    ) ?? 0;
  const igv = total * 0.18;
  const subtotal = total - igv;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!clientSelected) return setErrorMessage("Selecciona un cliente");
    if (!cart) {
      setErrorMessage("no se encontraron productos en el carrito");
      return;
    }
    if (cart.length === 0) return setErrorMessage("El carrito está vacío");

    const payload = {
      clientId: clientSelected.id,
      typeVoucher: voucherType,
      itemsSelected: cart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    };

    beginSellMutation.mutate(payload);
  };
  const handleNewSale = () => {
    setCart([])
    setClientSelected(null)
    setVoucherType('BOLETA')
    setSuccess(false)
    setProductsSearch('')
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-500/10">
          <i className=" text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-1">Venta Procesada</h2>
          <p className="text-sm text-gray-400 mb-1">
            {voucherType} emitido para <strong>{clientSelected?.name}</strong>
          </p>
          <p className="text-2xl font-bold mt-3 text-emerald-400 font-mono">
            S/. {total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={handleNewSale}
          className="px-6 py-3 rounded-xl text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        >
          Nueva Venta
        </button>
      </div>
    )
  }
}

export default POSPage;
