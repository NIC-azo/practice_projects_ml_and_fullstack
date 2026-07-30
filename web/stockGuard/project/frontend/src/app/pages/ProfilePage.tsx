import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { request } from "@/api/request.config";
import { useAuthStore } from "@/store/auth.store";
import type { UsersResponseData, CustomApiError } from "@/types/typos.bd";
import type { AxiosResponse } from "axios";

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Estados de control de UI y Formularios
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  // Formulario de Contraseña
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Mensajes de feedback
  const [formError, setFormError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // 1. Obtención del Perfil vía GET /users/profile (Extracción desde JWT en backend)
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UsersResponseData, CustomApiError>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await request("get", "/users/profile");
      const data = (res as AxiosResponse).data ?? res;
      setNameInput(data.name || "");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Generación de Iniciales para Avatar (cálculo directo ultraligero sin useMemo)
  const getUserInitials = (): string => {
    if (!profile?.name) return "U";
    const parts = profile.name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const userInitials = getUserInitials();

  // Cálculo de fortaleza de contraseña
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "" };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2)
      return {
        score: 33,
        label: "Débil",
        color: "bg-color-bg-danger text-color-text-danger",
      };
    if (score <= 4)
      return {
        score: 66,
        label: "Media",
        color: "bg-color-bg-warning text-color-text-warning",
      };
    return {
      score: 100,
      label: "Fuerte",
      color: "bg-color-bg-success text-color-text-success",
    };
  }, [newPassword]);

  // Validaciones
  const passwordsMatch = newPassword === confirmPassword;

  // 2. Mutaciones para actualización
  const updateProfileMutation = useMutation<
    unknown,
    CustomApiError,
    { name?: string; password?: string }
  >({
    mutationFn: (data) => {
      if (!user?.userId) throw new Error("Usuario no autenticado");
      return request("put", `/users/update/${user.userId}`, data);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setFormError("");

      if (variables.name) {
        setIsEditingName(false);
        setSuccessMessage("Nombre actualizado correctamente");
      }
      if (variables.password) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessMessage("Contraseña actualizada con éxito");
      }

      setTimeout(() => setSuccessMessage(""), 4000);
    },
    onError: (error) => {
      if (error.isNetworkError) {
        setFormError("Error de conexión con el servidor");
      } else {
        setFormError(error.message || "Error al actualizar la información");
      }
    },
  });

  // Handlers
  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!nameInput.trim()) {
      setFormError("El nombre no puede estar vacío");
      return;
    }
    updateProfileMutation.mutate({ name: nameInput.trim() });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!currentPassword) {
      setFormError("Debes ingresar tu contraseña actual");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setFormError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!passwordsMatch) {
      setFormError("Las contraseñas no coinciden");
      return;
    }

    updateProfileMutation.mutate({ password: newPassword });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-color-text-muted">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Toast / Banner de Feedback */}
      {(isError || formError.length > 0) && (
        <div className="p-4 rounded-xl bg-color-bg-danger border border-color-border-danger flex items-center justify-between text-color-text-danger animate-fade-in-form-modal">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-lg" />
            <span className="text-sm font-semibold">
              {formError || "Error al cargar el perfil."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFormError("")}
            className="cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-color-bg-success border border-color-border-success flex items-center justify-between text-color-text-success animate-fade-in-form-modal">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-lg" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>
      )}

      {/* Header del Perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-color-text-general">
            Mi Perfil
          </h1>
          <p className="text-sm text-color-text-muted mt-0.5">
            Gestiona la información de tu cuenta y opciones de seguridad
          </p>
        </div>

        {/* Acceso rápido para ADMIN */}
        {user?.rol === "ADMIN" && (
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-background-buttons text-color-text-button hover:opacity-90 transition-all cursor-pointer shadow-subtle self-start sm:self-auto"
          >
            <i className="fa-solid fa-users-gear text-base" />
            Ir a Gestión de Usuarios
          </button>
        )}
      </div>

      {/* Grid de 2 Secciones Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECCIÓN A: Información de la Cuenta */}
        <div className="bg-background-dark border border-color-border-card rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-color-border-card">
            <i className="fa-solid fa-id-card text-color-primary text-xl" />
            <h2 className="text-lg font-semibold text-color-text-general">
              Información de la Cuenta
            </h2>
          </div>

          {/* Avatar e Iniciales */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-background-buttons border border-color-border-focus flex items-center justify-center text-xl font-bold text-color-text-button shadow-lift">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-color-text-general">
                  {profile?.name}
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${
                    profile?.rol === "ADMIN"
                      ? "bg-color-bg-warning text-color-text-warning border-color-border-warning"
                      : "bg-color-bg-info text-color-text-info border-color-border-focus"
                  }`}
                >
                  {profile?.rol === "ADMIN" ? "👑 ADMIN" : "📦 ALMACENERO"}
                </span>
              </div>
              <p className="text-xs text-color-text-muted mt-1 flex items-center gap-1.5">
                <i className="fa-regular fa-calendar-check" />
                Miembro desde:{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          {/* Datos Visibles */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">
                Nombre Completo
              </label>
              {isEditingName ? (
                /* El form sólo envuelve los controles cuando está en modo edición */
                <form onSubmit={handleUpdateName} className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none bg-background-buttons border-color-border-focus text-color-text-button"
                  />
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-3 py-2 bg-color-bg-success text-color-text-success hover:opacity-90 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-check" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(profile?.name || "");
                    }}
                    className="px-3 py-2 bg-background-emojis-color-alert text-color-text-danger rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background-emojis-color border border-color-border-card">
                  <span className="text-sm font-medium text-color-text-general">
                    {profile?.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditingName(true);
                    }}
                    className="text-xs text-color-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-pen" /> Editar
                  </button>
                </div>
              )}
            </div>

            {/* Email (Sólo Lectura) */}
            <div>
              <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">
                Correo Electrónico (Solo Lectura)
              </label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background-emojis-color/50 border border-color-border-card opacity-80 cursor-not-allowed">
                <span className="text-sm text-color-text-muted font-mono">
                  {profile?.email}
                </span>
                <i
                  className="fa-solid fa-lock text-xs text-color-text-muted"
                  title="Solo modificable por un administrador"
                />
              </div>
            </div>

            {/* Rol (Sólo Lectura) */}
            <div>
              <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">
                Rol Asignado
              </label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background-emojis-color/50 border border-color-border-card opacity-80 cursor-not-allowed">
                <span className="text-sm text-color-text-muted font-semibold">
                  {profile?.rol}
                </span>
                <i
                  className="fa-solid fa-shield text-xs text-color-text-muted"
                  title="Rol asignado por sistema"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN B: Seguridad y Contraseña */}
        <div className="bg-background-dark border border-color-border-card rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-color-border-card">
            <i className="fa-solid fa-lock text-color-primary text-xl" />
            <h2 className="text-lg font-semibold text-color-text-general">
              Seguridad y Contraseña
            </h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">
                Contraseña Actual *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none bg-background-buttons border-color-border-input focus:border-color-border-focus text-color-text-button transition-all"
              />
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none bg-background-buttons border-color-border-input focus:border-color-border-focus text-color-text-button transition-all"
              />

              {/* Indicador Visual de Fortaleza */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-color-text-muted">Fortaleza:</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${passwordStrength.color}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-background-emojis-color rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score <= 33
                          ? "bg-color-border-danger"
                          : passwordStrength.score <= 66
                            ? "bg-color-border-warning"
                            : "bg-color-border-success"
                      }`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-color-text-muted uppercase mb-1">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none bg-background-buttons transition-all text-color-text-button ${
                  confirmPassword && !passwordsMatch
                    ? "border-color-border-danger focus:border-color-border-danger"
                    : "border-color-border-input focus:border-color-border-focus"
                }`}
              />

              {/* Alerta de Descoincidencia */}
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-color-text-danger mt-1 font-medium flex items-center gap-1">
                  <i className="fa-solid fa-circle-xmark" /> Las contraseñas no
                  coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending || !passwordsMatch}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-background-buttons hover:bg-background-buttons/80 text-color-text-button transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-key" />
              {updateProfileMutation.isPending
                ? "Actualizando..."
                : "Actualizar Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
