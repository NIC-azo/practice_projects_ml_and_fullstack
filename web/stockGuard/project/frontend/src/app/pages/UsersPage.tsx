import { request } from "@/api/request.config";
import type {
  UsersResponseData,
  UserManagement,
  Rol,
  CustomApiError,
} from "@/types/typos.bd";
import { useMemo, useState } from "react";
import DinamycForm from "@/app/components/ui/form/DinamycForm";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

const initialUserValue: UserManagement = {
  name: "",
  email: "",
  password: "",
  rol: "ALMACENERO",
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [formUsers, setFormUsers] = useState<UserManagement>(initialUserValue);
  const [active, setActive] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // 1. Obtención de usuarios mediante TanStack Query
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<UsersResponseData[], CustomApiError>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await request("get", "/users/");
      return Array.isArray(res) ? res : ((res as AxiosResponse).data ?? []);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const clearFields = () => {
    setFormUsers(initialUserValue);
    setIsEditing(false);
    setEditingId(null);
    setActive(false);
    setFormError("");
  };

  // 2. Mutaciones para operaciones en BD (Crear, Actualizar, Eliminar)
  const createUserMutation = useMutation<
    unknown,
    CustomApiError,
    UserManagement
  >({
    mutationFn: (newUser) => request("post", "/users/create", newUser),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexión con el servidor, inténtelo más tarde");
      } else if (error.status === 401) {
        setFormError("Su sesión ha expirado, intente iniciar sesión");
      } else if (error.status === 403) {
        setFormError("No estás permitido para realizar esta acción");
      } else {
        setFormError(error.message);
      }
    },
  });

  const updateUserMutation = useMutation<
    unknown,
    CustomApiError,
    { id: string; data: Partial<UserManagement> }
  >({
    mutationFn: ({ id, data }) => request("put", `/users/update/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexión con el servidor, inténtelo más tarde");
      } else if (error.status === 401) {
        setFormError("Su sesión ha expirado, intente iniciar sesión");
      } else if (error.status === 403) {
        setFormError("No estás permitido para realizar esta acción");
      } else {
        setFormError(error.message);
      }
    },
  });

  const deleteUserMutation = useMutation<
    unknown,
    CustomApiError,
    { id: string }
  >({
    mutationFn: ({ id }) => request("delete", `/users/delete/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      clearFields();
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexión con el servidor, inténtelo más tarde");
      } else if (error.status === 401) {
        setFormError("Su sesión ha expirado, intente iniciar sesión");
      } else if (error.status === 403) {
        setFormError("No estás permitido para realizar esta acción");
      } else {
        setFormError(error.message);
      }
    },
  });

  // 3. Handlers
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!formUsers.name || !formUsers.email || !formUsers.password) {
      setFormError(
        "Se necesita nombre, correo y contraseña para crear un usuario",
      );
      return;
    }
    createUserMutation.mutate(formUsers);
  };

  const handleUpdate = (id: string) => {
    setFormError("");
    if (!formUsers.name) {
      setFormError("El nombre no puede estar vacío");
      return;
    }

    // Si no se proporcionó una nueva contraseña en edición, la omitimos de la petición
    const updateData: Partial<UserManagement> = {
      name: formUsers.name,
      email: formUsers.email,
      rol: formUsers.rol,
    };
    if (formUsers.password && formUsers.password.trim() !== "") {
      updateData.password = formUsers.password;
    }

    updateUserMutation.mutate({ id, data: updateData });
  };

  // 4. Filtrado de usuarios con useMemo
  const filterUsers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return users;

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.rol.toLowerCase().includes(query),
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-color-text-muted">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      {/* Modal de Errores */}
      {(isError || formError.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 animate-fade-in-form-modal duration-200">
          <div className="relative w-full max-w-md bg-color-bg-danger p-6 rounded-2xl shadow-blur-for-shadows">
            <button
              type="button"
              onClick={() => setFormError("")}
              className="text-color-text-danger hover:text-text-button transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-square-xmark text-xl" />
            </button>
            <div className="pr-6">
              <p className="text-lg font-bold text-text-danger leading-snug">
                {formError || "Ocurrió un error al procesar los usuarios."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-color-text-general">
            Gestión de Usuarios
          </h1>
          <p className="text-sm mt-0.5 text-color-text-muted">
            {users.length} Usuarios registrados
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearFields();
            setActive(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 bg-background-buttons text-color-text-button cursor-pointer"
        >
          <i className="fa-solid fa-plus text-lg" /> Nuevo Usuario
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative max-w-sm">
        <i className="fa-solid fa-magnifying-glass text-lg absolute left-3 top-1/2 -translate-y-1/2 text-color-text-muted" />
        <input
          type="text"
          aria-label="buscar"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Buscar por nombre, correo o rol..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none bg-background-dark border-border-input text-text-general"
        />
      </div>

      {/* Modal Formulario de Creación */}
      <DinamycForm
        isOpen={active}
        setIsOpen={setActive}
        title="Registrar Usuario"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">
                Nombre *
              </label>
              <input
                value={formUsers.name}
                onChange={(e) =>
                  setFormUsers({ ...formUsers, name: e.target.value })
                }
                type="text"
                placeholder="ejem: Juan Pérez"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formUsers.email}
                onChange={(e) =>
                  setFormUsers({ ...formUsers, email: e.target.value })
                }
                placeholder="ejem: usuario@dominio.com"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                value={formUsers.password}
                onChange={(e) =>
                  setFormUsers({ ...formUsers, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all bg-background-buttons border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              />
            </div>
            <div className="font-medium">
              <label className="block text-sm text-text-info mb-1">Rol *</label>
              <select
                value={formUsers.rol || "ALMACENERO"}
                onChange={(e) =>
                  setFormUsers({
                    ...formUsers,
                    rol: e.target.value as Rol,
                  })
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all bg-background-buttons border-border-focus text-text-button hover:border-border-input/70 focus:border-border-focus/70"
              >
                <option value="ALMACENERO">ALMACENERO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          <div className="flex justify-evenly pt-4">
            <button
              type="submit"
              className="px-4 py-2 border text-text-button rounded-lg bg-background-buttons hover:bg-background-buttons/80 transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk text-lg" />
              Guardar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-color-text-danger hover:text-color-bg-danger transition-colors cursor-pointer flex items-center gap-2"
              onClick={() => setActive(false)}
            >
              <i className="fa-solid fa-ban text-lg" />
              Cancelar
            </button>
          </div>
        </form>
      </DinamycForm>

      {/* Tabla de Usuarios */}
      <div className="rounded-xl border overflow-hidden bg-background-dark border-border-card">
        {/* Cabecera */}
        <div className="grid grid-cols-[2fr_2fr_1.2fr_1.5fr_1fr] gap-4 bg-background-buttons backdrop-blur-sm p-4 text-color-text-button border-b border-color-border-card font-semibold text-sm">
          <div>Nombre</div>
          <div>Email</div>
          <div>Rol</div>
          <div>Fecha de Creación</div>
          <div className="text-center">Acciones</div>
        </div>

        {/* Contenido */}
        <div className="divide-y divide-color-border-card">
          {filterUsers.length === 0 ? (
            <div className="text-center p-8 text-sm text-color-text-muted">
              No se encontraron usuarios
            </div>
          ) : (
            filterUsers.map((u) => (
              <div
                className="grid grid-cols-[2fr_2fr_1.2fr_1.5fr_1fr] gap-4 p-4 items-center hover:bg-background-buttons/20 transition-all text-sm"
                key={u.id}
              >
                {/* Nombre */}
                <div className="flex items-center gap-2 truncate">
                  {isEditing && editingId === u.id ? (
                    <input
                      value={formUsers.name}
                      onChange={(e) =>
                        setFormUsers({ ...formUsers, name: e.target.value })
                      }
                      type="text"
                      placeholder="Nombre"
                      className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none bg-background-buttons border-border-focus text-text-button"
                    />
                  ) : (
                    <>
                      <span className="text-color-primary">
                        <i className="fa-solid fa-user-gear" />
                      </span>
                      <span className="font-medium text-text-info truncate">
                        {u.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Email */}
                <div className="font-mono text-xs text-text-info truncate">
                  {isEditing && editingId === u.id ? (
                    <input
                      value={formUsers.email}
                      onChange={(e) =>
                        setFormUsers({ ...formUsers, email: e.target.value })
                      }
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none bg-background-buttons border-border-focus text-text-button"
                    />
                  ) : (
                    u.email
                  )}
                </div>

                {/* Rol */}
                <div className="text-xs">
                  {isEditing && editingId === u.id ? (
                    <select
                      value={formUsers.rol || "ALMACENERO"}
                      onChange={(e) =>
                        setFormUsers({
                          ...formUsers,
                          rol: e.target.value as Rol,
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none bg-background-buttons border-border-focus text-text-button"
                    >
                      <option value="ALMACENERO">ALMACENERO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.rol === "ADMIN"
                          ? "bg-color-bg-info text-color-text-info"
                          : "bg-color-bg-warning text-color-text-warning"
                      }`}
                    >
                      {u.rol}
                    </span>
                  )}
                </div>

                {/* Fecha Creación */}
                <div className="font-mono text-xs text-color-text-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-center gap-4">
                  {editingId && isEditing && editingId === u.id ? (
                    <>
                      <button
                        type="button"
                        onClick={clearFields}
                        title="Cancelar"
                        className="text-color-text-danger hover:text-color-bg-danger transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-square-xmark text-lg" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(u.id)}
                        title="Guardar"
                        className="text-color-text-success hover:opacity-80 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-circle-check text-lg" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingId(u.id);
                          setFormUsers({
                            name: u.name,
                            email: u.email,
                            password: "", // Opcional al editar
                            rol: u.rol,
                          });
                        }}
                        title="Editar"
                        className="hover:text-color-primary transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-pen-to-square text-lg" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUserMutation.mutate({ id: u.id })}
                        title="Eliminar"
                        className="text-color-text-danger hover:text-color-bg-danger transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-lg" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
