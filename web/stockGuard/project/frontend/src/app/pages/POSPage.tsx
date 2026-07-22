import { request } from "@/api/request.config";
import {
  useQuery,
  useQueryClient,
  useMutation,
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
import { useMemo, useState } from "react";
import type { AxiosResponse } from "axios";

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
      const res = await request<ProductsResponseData[]>("get", "/products/");
      return Array.isArray(res) ? res : ((res as AxiosResponse).data ?? [])
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
      const res = await request<ClientsResponseData[]>("get", "/clients/");
      return Array.isArray(res) ? res : ((res as AxiosResponse).data ?? []);
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
  const [cart, setCart] = useState<CartItem[]>([]);
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
    const item = cart.find((i) => i.product.id === productId);
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
    cart.reduce(
      (sum, item) =>
        sum + getItemPrice(item.product, item.quantity) * item.quantity,
      0,
    ) ?? 0;
  const igv = total * 0.18;
  const subtotal = total - igv;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    setCart([]);
    setClientSelected(null);
    setVoucherType("BOLETA");
    setSuccess(false);
    setProductsSearch("");
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-500/10">
          <i className="fa-regular fa-circle-check text-emerald-500 text-lg" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-1">Venta Procesada</h2>
          <p className="text-sm text-color-text-general mb-1">
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
    );
  }

  return (
    <div className="flex gap-5 h-full min-h-[calc(100vh-120px)]">
      {(isErrorProducts || isErrorclients) && errorMessage.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 
          animate-fade-in-form-modal duration-200"
        >
          <div className="relative w-full max-w-md bg-background-emojis-color-alert p-6 rounded-2xl shadow-blur-for-shadows">
            <button type="button" onClick={() => setErrorMessage("")}>
              <i className="fa-solid fa-square-xmark text-xl text-background-emojis-color-alert hover:text-background-emojis-color-alert/60" />
            </button>
            <div className="pr-6">
              <p className="text-lg font-bold text-color-text-general leading-snug">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Columna Izquierda: Catálogo de Productos */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div>
          <h1 className="text-xl font-semibold text-color-text-general">
            Punto de Venta
          </h1>
          <p className="text-sm text-gray-400">
            Selecciona productos para la transacción
          </p>
        </div>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-background-emojis-color text-lg" />
          <input
            value={productsSearch}
            onChange={(e) => setProductsSearch(e.target.value)}
            placeholder="Buscar producto o código de barras..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-gray-700 bg-gray-900 outline-none focus:border-sky-500"
          />
        </div>
        {isLoadingProducts ? (
          <div className="flex-1 flex items-center justify-center">
            <i className="fa-solid fa-spinner animate-spin text-sky-500 text-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto flex-1">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={(product.current_stock ?? 0) <= 0}
                className="text-left rounded-xl border border-gray-800 bg-background-dinamyc-general p-4 transition-all hover:border-sky-500 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
                    <i className="fa-solid fa-box-open text-lg text-background-emojis-color" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <i className="fa-solid fa-plus text-background-emojis-color text-lg" />
                  </div>
                </div>
                <p className="text-sm font-medium leading-tight mb-1">
                  {product.name}
                </p>
                <p className="text-xs text-gray-400 font-mono mb-2">
                  {product.bars_code}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Precio Min.</p>
                    <p className="text-sm font-semibold text-emerald-400 font-mono">
                      S/. {Number(product.minorsale_price).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {product.current_stock} unid.
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Columna Derecha: Panel de Venta / Carrito */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col gap-4">
        {/* Selector de Cliente */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium text-gray-400 mb-2">CLIENTE</p>
          {clientSelected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-semibold">
                  {clientSelected.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{clientSelected.name}</p>
                  <p className="text-xs text-gray-400">
                    {clientSelected.dni || clientSelected.ruc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClientSelected(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-x" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-800 bg-gray-950">
                <i className="fa-solid fa-user text-gray-400 text-lg" />
                <input
                  value={clientsSearch}
                  onChange={(e) => {
                    setClientsSearch(e.target.value);
                    setclientDropOpen(true);
                  }}
                  onFocus={() => setclientDropOpen(true)}
                  placeholder={
                    isLoadingClients
                      ? "Cargando clientes..."
                      : "Buscar cliente..."
                  }
                  className="flex-1 text-sm bg-transparent outline-none"
                />
              </div>
              {clientDropOpen &&
                clientsSearch &&
                filteredClients.length > 0 && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 z-20 overflow-hidden shadow-xl">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={() => {
                          setClientSelected({
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            ruc: c.ruc,
                            dni: c.dni,
                            cellphone: c.cellPhone,
                          });
                          setClientsSearch("");
                          setclientDropOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm">{c.name}</span>
                        <span className="text-xs ml-auto text-gray-400">
                          {c.dni || c.ruc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
        {/* Tipo de Comprobante */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium text-gray-400 mb-2">COMPROBANTE</p>
          <div className="grid grid-cols-2 gap-2">
            {(["BOLETA", "FACTURA"] as VoucherType[]).map((v) => (
              <button
                key={v}
                onClick={() => setVoucherType(v)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  voucherType === v
                    ? "border-sky-500 bg-sky-500/10 text-sky-400"
                    : "border-gray-800 bg-gray-950 text-gray-400 hover:text-white"
                }`}
              >
                <i className="fa-solid fa-receipt text-lg text-background-emojis-color" />{" "}
                {v}
              </button>
            ))}
          </div>
        </div>
        {/* Listado de items en Carrito */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-cart-shopping text-sky-400 text-lg" />
              <span className="text-sm font-semibold">
                Carrito ({cart.length})
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-gray-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500">
                <i className="fa-solid fa-cart-shopping text-background-emojis-color opacity-40 text-lg" />
                <p className="text-xs">Carrito vacío</p>
              </div>
            ) : (
              cart.map((item, i) => {
                const price = getItemPrice(item.product, item.quantity);
                const isWholesale =
                  item.product.limit_minor_adquirition &&
                  item.quantity >= item.product.limit_minor_adquirition;

                return (
                  <div
                    key={item.product.id}
                    className={`px-4 py-3 ${i < cart.length - 1 ? "border-b border-gray-800" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium leading-tight pr-2">
                        {item.product.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <i className="fa-solid fa-trash text-background-emojis-color text-lg" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateProductQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center hover:bg-gray-700"
                        >
                          <i className="fa-solid fa-minus text-background-emojis-color text-lg" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateProductQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center hover:bg-gray-700"
                        >
                          <i className="fa-solid fa-plus text-background-emojis-color text-lg" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold font-mono">
                          S/. {(price * item.quantity).toFixed(2)}
                        </p>
                        <p
                          className={`text-xs ${isWholesale ? "text-purple-400" : "text-emerald-400"}`}
                        >
                          {isWholesale ? "x mayor" : "x menor"} · S/.{" "}
                          {price.toFixed(2)} c/u
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Resumen de totales y Acción de envío */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3"
        >
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal (sin IGV)</span>
              <span className="font-mono">S/. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>IGV (18%)</span>
              <span className="font-mono">S/. {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-gray-800 pt-2">
              <span>Total</span>
              <span className="font-mono text-emerald-400">
                S/. {total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              beginSellMutation.isPending || cart.length === 0 || !clientSelected
            }
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
          >
            {beginSellMutation.isPending ? (
              <i className="fa-solid fa-spinner text-sky-500 animate-spin text-lg" />
            ) : (
              <i className="fa-solid fa-credit-card text-background-emojis-color text-lg" />
            )}
            {beginSellMutation.isPending ? "Procesando..." : "Confirmar Venta"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default POSPage;
