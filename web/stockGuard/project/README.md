# 📦 Stock Guard - Sistema POS Fullstack

Sistema completo de Punto de Venta (POS) con gestión de inventario, usuarios, clientes e historial de ventas. Desarrollado con **Node.js + Express + TypeScript** en el backend y **React + Vite + TypeScript** en el frontend.

---

## 📁 Estructura del Proyecto

```
stockGuard/
├── backend/                    # API REST con Express
├── frontend/                   # Aplicación React con Vite
└── README.md
```

---

## 🔧 BACKEND - Explicación de Archivos

### **Configuración Principal**

#### `server.ts`
- **Propósito:** Archivo principal del servidor Express
- **Funciones:**
  - Instancia la aplicación Express
  - Configura CORS para permitir comunicación con el frontend
  - Middleware de parseo JSON y URL-encoded
  - Monta todas las rutas bajo `/api`
  - Escucha en puerto 3000 (dev) o variable de entorno

#### `prisma.config.ts`
- **Propósito:** Configuración de Prisma ORM
- **Funciones:**
  - Define el proveedor de base de datos (PostgreSQL)
  - Especifica archivos de migración
  - Genera cliente Prisma automáticamente

#### `.env`
- **Propósito:** Variables de entorno (no versionadas)
- **Contiene:**
  - Conexión a base de datos PostgreSQL
  - Puerto del servidor (LOCAL_PORT)
  - Secreto de sesión JWT
  - Configuración de frontend (FRONTEND_LOCAL)
  - Salts para encriptación de contraseñas

---

### **Estructura src/**

#### **src/controllers/**
- **Propósito:** Lógica de manejo de peticiones HTTP
- **Archivos:**
  
  - **`auth.controllers.ts`** - Autenticación
    - `login()` → Valida credenciales, genera JWT, retorna token
  
  - **`users.controllers.ts`** - Gestión de usuarios
    - `getUsers()` → Lista todos los usuarios activos
    - `createUser()` → Crea nuevo usuario con contraseña hasheada
    - `updateUser()` → Actualiza datos del usuario
    - `deleteUser()` → Desactiva usuario
    - `getUserForProfile()` → Obtiene perfil del usuario actual
  
  - **`products.controllers.ts`** - Gestión de productos
    - `getProducts()` → Lista productos activos
    - `createProduct()` → Crea producto con validaciones
    - `updateProduct()` → Actualiza datos del producto
    - `updateStockProduct()` → Incrementa/decrementa stock
    - `deleteProduct()` → Desactiva producto
  
  - **`clients.controllers.ts`** - Gestión de clientes
    - `getClients()` → Lista clientes
    - `createclients()` → Crea nuevo cliente
    - `updateclients()` → Actualiza datos del cliente
    - `deleteClients()` → Elimina cliente
  
  - **`sells.controllers.ts`** - Gestión de ventas
    - `initSell()` → Inicia nueva venta con items
    - `updateState()` → Cambia estado de venta (CANCELADO, EN_PROCESO, ANULADO)
  
  - **`dashboard.controllers.ts`** - Reportes y estadísticas
    - `productsAlert()` → Productos con stock bajo
    - `adminDataReports()` → Datos para dashboard (inventario, ventas, usuarios, transacciones)
  
  - **`history.controllers.ts`** - Historial de operaciones
    - `getHistory()` → Retorna todas las ventas realizadas

---

#### **src/models/**
- **Propósito:** Capa de acceso a datos (interacción con BD)
- **Patrón:** Cada modelo corresponde a una entidad del sistema
- **Métodos comunes:**

  - **`users.model.ts`**
    - `returnUsers()` → Obtiene todos los usuarios
    - `returnUser(id)` → Obtiene usuario específico
    - `returnUserByEmail(email)` → Busca por email
    - `createUser()` → Inserta nuevo usuario
    - `updateUser()` → Actualiza usuario
    - `deleteUser()` → Elimina usuario
  
  - **`products.model.ts`**
    - `getProductsDinamicly()` → Lista productos activos
    - `createProduct()` → Inserta producto
    - `updateProduct()` → Actualiza producto
    - `updateStockProduct()` → Modifica stock
    - `deleteProduct()` → Desactiva producto
  
  - **`clients.model.ts`**
    - `getClientsDinamicly()` → Lista clientes
    - `createClients()` → Inserta cliente
    - `updateClients()` → Actualiza cliente
    - `deleteClients()` → Elimina cliente
  
  - **`sells.model.ts`**
    - `initSell()` → Crea registro de venta
    - `updateSell()` → Actualiza estado de venta
  
  - **`dashboard.model.ts`**
    - `alertStock()` → Productos bajo stock mínimo
    - `totalInventoryValue()` → Valor total del inventario
    - `sellsToday()` → Total de ventas del día
    - `usersTotal()` → Cantidad de usuarios
    - `latest5Transactions()` → Últimas 5 transacciones
  
  - **`history.model.ts`**
    - `getUserSells()` → Historial de todas las ventas

---

#### **src/services/**
- **Propósito:** Lógica de negocio compleja (entre controllers y models)
- **Archivos:**

  - **`sells.service.ts`**
    - `initSell()` → Crea venta con detalles
      - Valida productos y stock disponible
      - Calcula precios (mayor/menor según cantidad)
      - Crea transacción: venta + detalles + actualiza stock
      - Retorna errores si hay inconsistencias

---

#### **src/middlewares/**
- **Propósito:** Procesa peticiones antes de llegar a controladores

  - **`auth.middlewares.ts`** - Autenticación
    - `authMiddleware()` → Verifica token JWT
    - Extrae payload del token y lo asigna a `req.user`
    - Bloquea requests sin token válido
  
  - **`role.middlewares.ts`** - Autorización por rol
    - `roleMiddleware(...roles)` → Valida que usuario tenga rol permitido
    - Verifica que usuario esté activo
    - Retorna 403 si rol no está autorizado
  
  - **`errors.middlewares.ts`** - Manejo de errores
    - `errorHandler()` → Wrapper para try-catch en controllers
    - Captura errores y retorna respuestas consistentes

---

#### **src/routes/**
- **Propósito:** Definición de endpoints HTTP

  - **`auth.routes.ts`**
    - `POST /api/auth/login` → Inicia sesión

  - **`users.routes.ts`**
    - `GET /api/users` → Lista usuarios (ADMIN)
    - `POST /api/users/create` → Crea usuario (ADMIN)
    - `PUT /api/users/update/:id_user` → Actualiza usuario (ADMIN)
    - `DELETE /api/users/delete/:id_user` → Elimina usuario (ADMIN)
    - `GET /api/users/profile` → Obtiene perfil actual

  - **`products.routes.ts`**
    - `GET /api/products` → Lista productos (ADMIN, ALMACENERO)
    - `POST /api/products/create` → Crea producto (ADMIN)
    - `PUT /api/products/update/:id_product` → Actualiza producto (ADMIN)
    - `PUT /api/products/updateStock/:id_product` → Actualiza stock (ADMIN, ALMACENERO)
    - `DELETE /api/products/delete/:id_product` → Elimina producto (ADMIN)

  - **`clients.routes.ts`**
    - `GET /api/clients` → Lista clientes (ADMIN)
    - `POST /api/clients/create` → Crea cliente (ADMIN, ALMACENERO)
    - `PUT /api/clients/update/:id_client` → Actualiza cliente (ADMIN)
    - `DELETE /api/clients/delete/:id_client` → Elimina cliente (ADMIN)

  - **`sells.routes.ts`**
    - `POST /api/sells/create` → Inicia venta (ADMIN, ALMACENERO)
    - `PUT /api/sells/update/:id_sell` → Cambia estado (ADMIN, ALMACENERO)

  - **`dashboard.routes.ts`**
    - `GET /api/dashboard/alerts` → Alertas de stock (ADMIN, ALMACENERO)
    - `GET /api/dashboard/reportsData` → Reportes (ADMIN)

  - **`history.routes.ts`**
    - `GET /api/history` → Historial de ventas (ADMIN)

  - **`index.routes.ts`**
    - Centraliza todas las rutas anteriores

---

#### **src/types/**
- **Propósito:** Definiciones de tipos TypeScript

  - **`bd.types.ts`**
    - `Rol` → 'ADMIN' | 'ALMACENERO'
    - `TypeVoucher` → 'BOLETA' | 'FACTURA'
    - `Status` → 'CANCELADO' | 'EN_PROCESO' | 'ANULADO'
    - Interfaces para modelos: `modelUser`, `modelProducts`, `modelClients`, `InitSell`
    - Interfaces para respuestas: `JwtPayload`, `AuthResponse`
  
  - **`express.d.ts`**
    - Extiende tipo `Express.Request` con propiedad `user?: JwtPayload`
    - Permite acceso a `req.user` en middlewares y controladores

---

#### **src/utils/**
- **Propósito:** Funciones y clases utilitarias

  - **`typos.express.ts`** - Clase para respuestas HTTP
    - `ApiResponse.auth()` → Respuesta de autenticación con token
    - `ApiResponse.returnResults()` → Retorna datos (GET, etc.)
    - `ApiResponse.operations()` → Retorna mensaje de éxito
    - `ApiResponse.errorOperations()` → Retorna error con estado HTTP

---

#### **src/lib/**
- **Propósito:** Configuraciones generales

  - **`connection.ts`** - Conexión a base de datos
    - Instancia Pool de PostgreSQL
    - Configura adaptador Prisma
    - Maneja variables de entorno (dev/production)
    - Exporta instancia de PrismaClient para usar en toda la app

---

### **prisma/**

#### `schema.prisma`
- **Propósito:** Define estructura de la base de datos
- **Entidades:**
  - `Users` → Usuarios del sistema
  - `Products` → Productos en inventario
  - `Clients` → Clientes
  - `Sells` → Encabezado de ventas
  - `SellDetails` → Detalles de items en cada venta

#### `seed.ts`
- **Propósito:** Población inicial de datos
- Crea usuario ADMIN por defecto
- Se ejecuta con: `npm run prisma:seed`

#### `migrations/`
- **Propósito:** Historial de cambios de esquema
- Cada migración es un archivo SQL de cambios incrementales
- Permite revertir o avanzar versiones del schema

---

## 🎨 FRONTEND - Explicación de Archivos

### **Archivos Raíz**

#### `main.tsx`
- **Propósito:** Punto de entrada principal
- **Funciones:**
  - Importa React y ReactDOM
  - Monta el componente App en el DOM
  - Carga estilos globales

#### `App.tsx`
- **Propósito:** Componente raíz de la aplicación
- **Funciones:**
  - Envuelve toda la app con BrowserRouter
  - Configura QueryClient para react-query
  - Define handlers globales de errores (401, 403)
  - Monta ReactQueryDevtools

#### `index.css`
- **Propósito:** Estilos CSS globales
- **Contiene:** Reset, tipografía base

#### `tailwind.css`
- **Propósito:** Estilos de Tailwind CSS
- **Contiene:** Directivas de Tailwind (@tailwind, @apply, etc.)

#### `theme.css`
- **Propósito:** Variables de color del tema
- **Contiene:**
  - Paleta de colores para light/dark mode
  - Colores personalizados del sistema
  - Variables de sombras

---

### **src/router/**

#### `index.tsx` - AppRouter
- **Propósito:** Define todas las rutas de la aplicación
- **Estructura:**
  - Ruta raíz `/` → Redirecciona a `/dashboard`
  - **PublicRoutes** (RedirectGuest):
    - `/login` → Página de login (si autenticado, va a dashboard)
  - **ProtectedRoutes** (ProtectedRoutes):
    - `/dashboard` → Dashboard de reportes
    - `/products` → Gestión de productos
    - `/pos` → Sistema POS (punto de venta)
    - `/clients` → Gestión de clientes
    - `/users` → Gestión de usuarios (solo ADMIN)
    - `/history` → Historial de ventas (solo ADMIN)
    - `/profile` → Perfil del usuario

---

### **src/secure/**

#### `ProtectedRoutes.tsx`
- **Propósito:** Componente que protege rutas autenticadas
- **Funciones:**
  - Verifica si `isAutenticated` es true
  - Valida que usuario tenga rol permitido
  - Redirige a `/login` si no autenticado
  - Redirige a `/unauthorized` si rol no permitido
  - Renderiza `<Outlet />` si todo es válido

#### `RedirectGuest.tsx`
- **Propósito:** Componente que redirige usuarios autenticados
- **Funciones:**
  - Si usuario está autenticado → redirige a `/dashboard`
  - Si NO está autenticado → permite continuar
  - Usado para rutas públicas como `/login`

---

### **src/api/**

#### `axios.api.ts`
- **Propósito:** Instancia configurada de Axios
- **Funciones:**
  - Configura baseURL según entorno (dev/prod)
  - Timeout de 10 segundos
  - **Interceptor de Request:**
    - Agrega token JWT del localStorage al header `Authorization`
  - **Interceptor de Response:**
    - Normaliza errores a formato consistente
    - Diferencia entre errores de red y de servidor

#### `request.config.ts`
- **Propósito:** Función genérica para hacer requests
- **Función principal:**
  ```typescript
  request<T>(method, url, data?, config?)
  ```
  - Acepta cualquier método HTTP (GET, POST, PUT, DELETE, PATCH)
  - Retorna datos tipados con genéricos
  - Simplifica llamadas a API desde componentes

---

### **src/store/**

#### `auth.store.ts` - Zustand Store
- **Propósito:** Gestión global de autenticación
- **Estado:**
  - `token` → JWT del usuario
  - `user` → Datos del usuario (id, rol)
  - `isAutenticated` → Boolean de sesión activa
- **Métodos:**
  - `login(token, user)` → Guarda sesión en localStorage
  - `logout()` → Limpia sesión
  - `checkAuth()` → Valida sesión al cargar app
- **Persistencia:** localStorage con keys `stockGuard-token` y `stockGuard-user`

#### `theme.store.ts` - Zustand Store
- **Propósito:** Gestión del tema (light/dark)
- **Estado:**
  - `theme` → 'light' | 'dark'
- **Métodos:**
  - `toggleTheme()` → Cambia tema y actualiza clase `dark` en HTML
- **Persistencia:** localStorage con key `stockGuard-theme`

---

### **src/types/**

#### `typos.bd.ts`
- **Propósito:** Tipos TypeScript sincronizados con backend
- **Tipos principales:**
  - `Rol` → 'ADMIN' | 'ALMACENERO'
  - `VoucherType` → 'BOLETA' | 'FACTURA'
  - `UserForTypos` → Datos del usuario
  - `AuthResponseTypo` → Respuesta de login
  - `ProductsResponseData` → Datos de producto
  - `ClientsResponseData` → Datos de cliente
  - `UsersResponseData` → Datos de usuario
  - `HistoryResponseData` → Datos de venta
  - `CustomApiError` → Error normalizado

---

### **src/layout/**

#### `MainLayout.tsx`
- **Propósito:** Layout principal de la aplicación
- **Componentes:**
  - **Sidebar izquierda:**
    - Logo y nombre de app
    - Navegación con iconos FontAwesome
    - Items visibles según rol (Users/History solo ADMIN)
    - Toggle de tema
    - Botón de cerrar sesión
  - **Botón de colapsar:** Minimiza sidebar
  - **Main area:** Renderiza páginas con `<Outlet />`
- **Funciones:**
  - Collapse/expand del sidebar
  - Logout y redirección a login
  - Tema dinámico

---

### **src/app/pages/**

#### `Login.tsx`
- **Propósito:** Página de autenticación
- **Funciones:**
  - Formulario de email y contraseña
  - Valida credenciales con backend
  - Guarda token y usuario en store
  - Redirige a dashboard si éxito
- **Estados:**
  - Loading, error, campos de formulario

#### `Dashboard.tsx`
- **Propósito:** Panel de reportes y estadísticas
- **Widgets:**
  - Valor total del inventario
  - Ventas del día
  - Total de usuarios
  - Últimas 5 transacciones
- **Alertas:**
  - Productos con stock bajo (< stock mínimo)
- **Datos:** Obtiene de `/api/dashboard/`

#### `POSPage.tsx`
- **Propósito:** Sistema de Punto de Venta
- **Funciones:**
  - Búsqueda de productos por código de barras
  - Selecciona cliente para la venta
  - Carrito de compras con items
  - Tipo de comprobante (BOLETA/FACTURA)
  - Cálculo automático de precios (mayor/menor por cantidad)
  - Resumen con subtotal, descuento, total
  - Finaliza venta
- **Lógica especial:**
  - Precios dinámicos según `limit_minor_adquirition`

#### `ProductsPage.tsx`
- **Propósito:** Gestión de inventario
- **Funciones:**
  - Listado de productos activos
  - Búsqueda y filtros
  - Crear nuevo producto
  - Editar producto existente
  - Ver detalles de producto
  - Incrementar stock
  - Eliminar producto
- **Modal dinámico:** Reutiliza DinamycForm para crear/editar

#### `ClientsPage.tsx`
- **Propósito:** Gestión de clientes
- **Funciones:**
  - Listado de clientes
  - Crear cliente
  - Editar cliente
  - Eliminar cliente
  - Campos: nombre, email, DNI, RUC, teléfono

#### `UsersPage.tsx` (Solo ADMIN)
- **Propósito:** Gestión de usuarios
- **Funciones:**
  - Crear usuario nuevo
  - Asignar roles (ADMIN, ALMACENERO)
  - Editar datos del usuario
  - Eliminar usuario
  - Activar/desactivar usuarios

#### `HistoryPage.tsx` (Solo ADMIN)
- **Propósito:** Historial de ventas
- **Funciones:**
  - Listado de todas las ventas realizadas
  - Ver detalles de cada venta
  - Filtros por fecha, usuario, estado
  - Cambiar estado de venta (CANCELADO, EN_PROCESO, ANULADO)

#### `ProfilePage.tsx`
- **Propósito:** Perfil del usuario actual
- **Funciones:**
  - Ver datos del usuario
  - Cambiar contraseña
  - Editar nombre
  - Ver rol asignado

---

## 🐛 Troubleshooting - Resolución de Problemas

### **Problema: El formulario de crear producto no ejecuta la acción**

#### 📋 Descripción
Cuando se hace clic en el botón "Guardar" en el formulario modal para crear un nuevo producto, no sucede ninguna acción visible:
- No hay errores en la consola del navegador
- No hay peticiones HTTP en la pestaña Network
- El modal se queda bloqueado

#### 🔍 Causa Raíz
En [ProductsPage.tsx](frontend/src/app/pages/ProductsPage.tsx), la función `handleSubmit` tiene una validación que retorna early si `handleModal === "view"`:

```typescript
const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (handleModal === "view") return;  // ← Retorna aquí si es "view"
    // ... resto del código
};
```

**Problema:** Cuando se abrí­a el modal con el botón "Nuevo Producto", solo se establecía `setActive(true)` pero **no se cambiaba el estado `handleModal`**, que seguí­a siendo su valor inicial `"view"`. Esto causaba que el submit sea interceptado inmediatamente.

#### ✅ Solución Aplicada

**1. Archivo: [ProductsPage.tsx - Línea 588-598](frontend/src/app/pages/ProductsPage.tsx#L588-L598)**

Se modificó el onClick del botón "Nuevo Producto" para establecer todos los estados necesarios:

```typescript
// ❌ ANTES
onClick={() => {
    setIsEditing(false);
    setActive(true);  // ← Solo abrí­a el modal
}}

// ✅ DESPUÉS
onClick={() => {
    setIsEditing(false);
    setEditingId(null);           // ← Limpia ID de edición
    setFormData(initialProductValues);  // ← Reinicia formulario
    setHandleModal("edit");       // ← Cambia estado a "edit" (permitido en submit)
    setActive(true);              // ← Abre el modal
}}
```

**2. Archivo: [ProductsPage.tsx - Línea 157](frontend/src/app/pages/ProductsPage.tsx#L157)**

Se corrigió el tipo del evento del handler para mayor precisión en TypeScript:

```typescript
// ❌ ANTES
const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {

// ✅ DESPUÉS
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
```

#### 🔄 Flujo de Funcionamiento Correcto

1. Usuario hace clic en **"Nuevo Producto"**
2. Se ejecutan estos cambios de estado:
   - `setEditingId(null)` - No está editando un producto existente
   - `setFormData(initialProductValues)` - Limpia campos del formulario
   - `setHandleModal("edit")` - Cambia a modo "edit" (permitido en submit)
   - `setActive(true)` - Abre el modal
3. El modal [DinamycForm](frontend/src/app/components/ui/form/DinamycForm.tsx) se abre con el formulario
4. Usuario llena los campos del producto
5. Usuario hace clic en **"Guardar"**
6. `handleSubmit` se ejecuta:
   - Verifica `if (handleModal === "view")` → **FALSE** (es "edit", no "view")
   - Continúa con la lógica normal
   - `createProductHandler.mutate()` → Envía POST a `/api/products/create`
7. Respuesta del servidor:
   - ✅ Éxito: Modal se cierra, lista se actualiza
   - ❌ Error: Se muestra mensaje de error en el modal

#### 📝 Estados Clave en ProductsPage

| Variable | Inicial | En crear | En editar | En ver | Nota |
|----------|---------|----------|-----------|--------|------|
| `active` | false | true | true | true | Abre/cierra modal |
| `handleModal` | "view" | **"edit"** | "edit" | "view" | Controla qué se renderiza |
| `editingId` | null | **null** | "id-xxx" | "id-xxx" | Identifica el producto |
| `isEditing` | false | **false** | true | false | Indica modo edición |

#### 🎯 Conclusión

El problema era que el estado `handleModal` no se actualizaba al abrir el modal para crear un producto, causando que la validación `if (handleModal === "view")` bloqueara la ejecución del submit. 

Al agregar `setHandleModal("edit")` en el onClick del botón "Nuevo Producto", el formulario ahora se procesa correctamente.

#### `Unauthorized.tsx`
- **Propósito:** Página de error de permiso denegado
- Muestra cuando usuario no tiene rol requerido

---

### **src/app/components/**

#### **src/app/components/themes/ThemeToggle.tsx**
- **Propósito:** Botón para cambiar tema
- **Funciones:**
  - Click → ejecuta `toggleTheme()` del store
  - Icono dinámico (luna/sol) según tema actual
  - Se integra en MainLayout

#### **src/app/components/ui/form/DinamycForm.tsx**
- **Propósito:** Modal genérica reutilizable
- **Props:**
  - `title` → Título del modal
  - `isOpen` → Boolean para mostrar/ocultar
  - `setIsOpen` → Callback para cerrar
  - `size` → Tamaño (sm, md, lg, xl)
  - `children` → Contenido del modal
- **Funciones:**
  - Overlay con blur
  - Click en overlay → cierra modal
  - Tecla ESC → cierra modal
  - Botón de cerrar X
  - Scroll interno si contenido es muy largo
- **Usado en:** ProductsPage, ClientsPage, UsersPage para crear/editar

---

## 🔄 Flujo de Datos

### **Autenticación:**
1. Usuario ingresa credenciales en `Login.tsx`
2. Envía POST a `/api/auth/login`
3. Backend valida y retorna JWT
4. Frontend guarda en `auth.store` y localStorage
5. Router redirige a `/dashboard`
6. Cada request incluye token en header

### **Venta (POS):**
1. Usuario busca producto en `POSPage.tsx`
2. Selecciona cliente y agrega items al carrito
3. Calcula precios automáticamente
4. Click en "Completar Venta" → POST a `/api/sells/create`
5. Backend:
   - Valida productos y stock
   - Calcula total
   - Crea venta + detalles en transacción
   - Decrementa stock de productos
6. Frontend muestra confirmación y limpia carrito

### **Gestión de Productos:**
1. Admin navega a `ProductsPage.tsx`
2. Puede crear, editar o eliminar productos
3. Cambios se sincronizan con backend
4. React Query actualiza estado y cachés

---

## 📦 Dependencias Clave

### **Backend:**
- **express** → Framework web
- **prisma** → ORM para PostgreSQL
- **bcrypt** → Encriptación de contraseñas
- **jsonwebtoken** → Tokens JWT
- **cors** → Manejo de CORS
- **pg** → Driver PostgreSQL

### **Frontend:**
- **react** → UI library
- **react-router-dom** → Routing
- **react-query** → State management para datos del servidor
- **zustand** → State management para estado global
- **axios** → HTTP client
- **tailwindcss** → Utility-first CSS
- **vite** → Build tool

---

## 🚀 Comandos Útiles

### **Backend:**
```bash
npm run dev              # Inicia servidor en modo desarrollo
npm run build           # Compila TypeScript
npm run prisma:seed    # Llena BD con datos iniciales
npm run prisma:migrate # Ejecuta migraciones pendientes
npm run prisma:studio  # Abre Prisma Studio (GUI)
```

### **Frontend:**
```bash
npm run dev            # Inicia dev server en localhost:5173
npm run build          # Compila para producción
npm run preview        # Vista previa de build
npm run lint           # Valida código con ESLint
```

---

## 💾 Base de Datos

- **Proveedor:** PostgreSQL
- **Herramienta ORM:** Prisma
- **Entidades:** Users, Products, Clients, Sells, SellDetails
- **Migraciones:** Almacenadas en `prisma/migrations/`

---

## 🔐 Seguridad

- **Autenticación:** JWT de 24 horas
- **Contraseñas:** Hasheadas con bcrypt (10 salts)
- **Autorización:** Middleware por rol (ADMIN/ALMACENERO)
- **CORS:** Configurado para frontend local
- **Validaciones:** Backend valida todos los inputs

---

## 📝 Notas

- Todos los archivos `.env` están en `.gitignore`
- TypeScript configurado para máxima seguridad de tipos
- Prisma genera tipos automáticamente
- React Query cachea datos para mejor UX
- Zustand maneja estado global de forma ligera
