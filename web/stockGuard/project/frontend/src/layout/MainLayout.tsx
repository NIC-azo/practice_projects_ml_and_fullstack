import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { NavItems } from "@/types/typos.bd";
import { useState } from "react";
import ToggleTheme from "@/app/components/themes/ThemeToggle";
import { useThemeStore } from "@/store/theme.store";

const navItems: NavItems[] = [
    {to: '/dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard'},
    {to: '/pos', icon: 'fa-solid fa-cart-arrow-down', label: 'Punto de Ventas'},
    {to: '/products', icon: 'fa-solid fa-cart-flatbed', label: 'Productos'},
    {to: '/clients', icon: 'fa-solid fa-users', label: 'Clientes'},
    {to: '/users', icon: 'fa-solid fa-user-gear', label: 'Usuarios', adminOnly: true},
    {to: '/history', icon: 'fa-solid fa-book', label: 'Historial', adminOnly: true},
    {to: '/profile', icon: 'fa-solid fa-circle-user', label: 'Perfil'},
];

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {user, logout} = useAuthStore();
    const {theme} = useThemeStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }


    const visibleNav = navItems.filter((item) => item.adminOnly && user?.rol !== "ADMIN"
    ? false : true);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dinamyc-general 
        text-color-text-general font-sans transition-colors duration-300">
            <aside className={`flex flex-col h-full transition-all duration-300 shrink-0 border-r 
            ${collapsed ? 'w-16' : 'w-54'} bg-background-dinamyc-general/10 border-background-dinamyc-general/20`}>
                <div className="flex items-center gap-3 px-4 py-5 border-b border-background-buttons/20">
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-background-buttons">
                        <i className="fa-solid fa-store text-color-text-button"/>
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-color-text-general">Stock Guard System</p>
                            <p className="text-xs truncate text-color-text-general/60">{user?.rol}</p>
                        </div>
                    )}
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {visibleNav.map(({to, icon: Icon, label}) => (
                        <NavLink 
                            to={to}
                            key={to}
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150
                            ${isActive ? 'text-color-text-button bg-background-buttons' : 
                                'text-color-text-general/70 hover:text-color-text-general hover:bg-background-buttons/10'}`}
                            title={collapsed ? label : undefined}
                            >
                            <i className={Icon + ' text-lg shrink-0'}/>
                            {!collapsed && <span className="text-sm font-medium">{label}</span>}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-2 space-y-2 border-t border-background-buttons/20">
                    <div className={`flex items-center cursor-pointer ${collapsed ? 'justify-center' : 'justify-between px-3 py-1'}`}>
                        {!collapsed && <span className="text-xs font-medium text-color-text-general/60">{
                            theme === "dark" ? "Modo Oscuro" : "Modo Claro"
                        }</span>}
                        <ToggleTheme />
                    </div>
                    <button 
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full transition-all duration-150 cursor-pointer
                    bg-background-emojis-color-alert/10 hover:bg-background-emojis-color-alert text-background-emojis-color-alert 
                    hover:text-color-text-button text-left"
                    aria-label={collapsed ? 'cerrar sesion' : undefined}
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket shrink-0"/>
                        {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>
            <button
                onClick={() => setCollapsed(c => !c)}
                type="button"
                title={collapsed ? 'ver mas' : 'colapsar'}
                className={`absolute z-10 flex items-center justify-center w-4 h-8 rounded-r-md border border-l-0 border-background-buttons/20 
                    transition-all duration-300 bg-background-dark text-color-text-general
                    ${collapsed ? 'left-16' : 'left-54'} top-[50%] -translate-y-1/2`}>
                <i className={collapsed ? `fa-solid  fa-chevron-right text-xs` : `fa-solid fa-chevron-left text-xs`}/>
            </button>
            <main className="flex-1 flex flex-col overflow-hidden bg-background-dark/40">
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;