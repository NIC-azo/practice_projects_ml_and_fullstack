import { request } from "@/api/request.config";
import type {
  ClientsResponseData,
  ClientsManagement,
  CustomApiError,
} from "@/types/typos.bd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AxiosResponse } from "axios";
import { useAuthStore } from "@/store/auth.store";

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
  const { user } = useAuthStore();
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
    
  }
}

export default ClientsPage;
