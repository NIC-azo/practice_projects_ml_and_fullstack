import { request } from "@/api/request.config";
import type {
  ClientsResponseData,
  ClientsManagement,
  CustomApiError,
} from "@/types/typos.bd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AxiosResponse } from "axios";
import DinamycForm from "@/app/components/ui/form/DinamycForm";

const initialClientsValue: ClientsManagement = {
  name: "",
  email: "",
  dni: "",
  ruc: "",
  cellphone: "",
};

function ClientsPage() {
  const queryClient = useQueryClient();
  const [formClients, setFormClients] =
    useState<ClientsManagement>(initialClientsValue);
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery<ClientsResponseData[], CustomApiError>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await request("get", "/clients/");
      return Array.isArray(res) ? res : ((res as AxiosResponse).data ?? []);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const [active, setActive] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const clearFields = () => {
    setFormClients(initialClientsValue);
    setIsEditing(false);
    setEditingId(null);
    setActive(false);
  };

  // mutations para realizar operaciones a la bd
  const createClientMutation = useMutation<
    unknown,
    CustomApiError,
    ClientsManagement
  >({
    mutationFn: (newClient) => request("post", "/clients/create", newClient),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
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
  const updateClientMutation = useMutation<
    unknown,
    CustomApiError,
    { id: string; data: ClientsManagement }
  >({
    mutationFn: ({ data, id }) => request("put", `/clients/update/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
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
  const deleteClientMutation = useMutation<
    unknown,
    CustomApiError,
    { id: string }
  >({
    mutationFn: ({ id }) => request("delete", `/clients/delete/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
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

  // handlers
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!formClients) {
      setFormError(
        "se necesita por lo menos el nombre del cliente para crearlo",
      );
      return;
    }
    createClientMutation.mutate(formClients);
  };
  // filtrar productos
  const filterClients = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return clients;

    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.dni?.toLowerCase().includes(query) ||
        c.ruc?.toLowerCase().includes(query) ||
        c.cellPhone?.toLowerCase().includes(query),
    );
  }, [clients, search]);

  if (isLoading) {
    return (
      <div className="">
        <p className="">cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      {/**modal de errores de cada operacion */}
      {isError ||
        (formError.length > 0 && (
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
        ))}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-color-text-general">
            Gestión de Clientes
          </h1>
          <p className="text-sm mt-0.5 text-color-text-muted">
            {clients.length} Clientes registrados
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setEditingId(null);
            setFormClients(initialClientsValue);
            setActive(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90
          bg-background-buttons text-color-text-button cursor-pointer"
        >
          <i className="fa-solid fa-plus text-lg" /> Nuevo Cliente
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
          border-border-input text-text-general"
        />
      </div>
      {/**form */}
      <DinamycForm
        isOpen={active}
        setIsOpen={setActive}
        title="Registrar Cliente"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">
                Nombre *
              </label>
              <input
                value={formClients.name}
                onChange={(e) =>
                  setFormClients({ ...formClients, email: e.target.value })
                }
                type="text"
                placeholder="ejem: pedro ..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">Email</label>
              <input
                type="email"
                value={formClients.email ?? "email@gmail"}
                onChange={(e) =>
                  setFormClients({ ...formClients, email: e.target.value })
                }
                placeholder="ejem: cualquiercosa@dominio.com"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">DNI</label>
              <input
                type="number"
                value={formClients.dni ?? "12345678"}
                onChange={(e) =>
                  setFormClients({ ...formClients, dni: e.target.value })
                }
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">RUC</label>
              <input
                type="text"
                value={formClients.ruc ?? "10...dni"}
                onChange={(e) =>
                  setFormClients({ ...formClients, ruc: e.target.value })
                }
                placeholder="10...numero dni"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">
                N° telefono
              </label>
              <input
                type="number"
                value={formClients.cellphone ?? "9 numeros"}
                onChange={(e) =>
                  setFormClients({ ...formClients, cellphone: e.target.value })
                }
                placeholder="910..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="flex justify-evenly">
              <button
                type="submit"
                className="px-4 py-2 border text-text-button rounded-lg bg-background-buttons hover:bg-background-buttons/80 transition-colors cursor-pointer"
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
          </div>
        </form>
      </DinamycForm>
      {/** tabla */}
      <div className="rounded-xl border overflow-hidden bg-background-dark border-border-card">
        {/**cabecera */}
        <div
          className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1.2fr_1fr] gap-4 bg-background-buttons backdrop-blur-sm
        p-4 text-color-text-button border-b border-color-border-card font-semibold text-sm"
        >
          <div className="text-center">Nombre</div>
          <div className="text-center">Email</div>
          <div className="text-center">DNI</div>
          <div className="text-center">RUC</div>
          <div className="text-center">N° celular/telefono</div>
          <div className="text-center">Acciones</div>
        </div>
        {/**contenido */}
        <div className="divide-y divide-color-border-card">
          {filterClients.length === 0 ? (
            <div className="text-center p-8 text-sm text-color-text-muted">
              No se encontraron productos
            </div>
          ) : (
            filterClients.map((c) => (
              <div
                className="grid grid-cols-6 gap-4 p-4 items-center 
                  hover:bg-background-buttons/20 transition-all text-sm"
                key={c.id}
              >
                {/** nombre */}
                <div className="flex items-center gap-2 truncate">
                  {isEditing && editingId === c.id ? (
                    <>
                      <input
                        value={c.name}
                        onChange={(e) =>
                          setFormClients({
                            ...formClients,
                            email: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="ejem: pedro ..."
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                      border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-color-text-warning">
                        <i className="fa-solid fa-address-card" />
                      </span>
                      <span className="font-medium text-text-info truncate">
                        {c.name}
                      </span>
                    </>
                  )}
                </div>
                {/** email */}
                <div className="font-mono text-xs text-text-info">
                  {isEditing && editingId === c.id ? (
                    <>
                      <input
                        value={c.email ?? ""}
                        onChange={(e) =>
                          setFormClients({
                            ...formClients,
                            email: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="ejem: pedro ..."
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                      border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-color-text-warning">
                        <i className="fa-solid fa-address-card" />
                      </span>
                      <span className="font-medium text-text-info truncate">
                        {c.email}
                      </span>
                    </>
                  )}
                </div>
                {/** dni */}
                <div className="font-mono text-xs text-text-info">
                  {isEditing && editingId === c.id ? (
                    <>
                      <input
                        value={c.dni ?? ""}
                        onChange={(e) =>
                          setFormClients({
                            ...formClients,
                            email: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="ejem: pedro ..."
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                      border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-color-text-warning">
                        <i className="fa-solid fa-address-card" />
                      </span>
                      <span className="font-medium text-text-info truncate">
                        {c.dni}
                      </span>
                    </>
                  )}
                </div>
                {/** ruc */}
                <div className="font-mono text-xs text-text-info">
                  {isEditing && editingId === c.id ? (
                    <>
                      <input
                        value={c.ruc ?? ""}
                        onChange={(e) =>
                          setFormClients({
                            ...formClients,
                            email: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="ejem: pedro ..."
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                      border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-color-text-warning">
                        <i className="fa-solid fa-address-card" />
                      </span>
                      <span className="font-medium text-text-info truncate">
                        {c.ruc}
                      </span>
                    </>
                  )}
                </div>
                {/** cellphone */}
                <div className="font-mono text-xs text-text-info">
                  {isEditing && editingId === c.id ? (
                    <>
                      <input
                        value={c.cellPhone ?? ""}
                        onChange={(e) =>
                          setFormClients({
                            ...formClients,
                            email: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="ejem: pedro ..."
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons
                      border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-color-text-warning">
                        <i className="fa-solid fa-address-card" />
                      </span>
                      <span className="font-medium text-text-info truncate">
                        {c.cellPhone}
                      </span>
                    </>
                  )}
                </div>
                {/**acciones */}
                <div className="flex items-center justify-center gap-5">
                  {/**si esta en modo edicion y hay id */}
                  {editingId && isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingId(null);
                        }}
                      >
                        <i className="fa-solid fa-square-xmark" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateClientMutation.mutate({
                            id: c.id,
                            data: formClients,
                          })
                        }
                      >
                        <i className="fa-solid fa-circle-check" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(true);
                          setEditingId(c.id);
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteClientMutation.mutate({ id: c.id })}
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientsPage;
