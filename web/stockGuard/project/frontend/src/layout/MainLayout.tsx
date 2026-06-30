import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { NavItems } from "@/types/typos.bd";
import { useState } from "react";

const navItems: NavItems[] = [
    {to: '/pos', icon: 'fa-solid fa-cart-arrow-down', label: 'Punto de Ventas'},
    {to: '/products', icon: 'fa-solid fa-cart-flatbed', label: 'Productos'},
    {to: '/clients', icon: 'fa-solid fa-users', label: 'Clientes'},
    {to: '/users', icon: 'fa-solid fa-user-gear', label: 'Usuarios', adminOnly: true},
    {to: '/history', icon: 'fa-solid fa-book', label: 'Historial', adminOnly: true},
    {to: '/profile', icon: 'fa-circle-user', label: 'Perfil'},
    {to: '/dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard'},
];

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {user, logout} = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }


    const visibleNav = navItems.filter((item) => item.adminOnly);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dinamyc-general font-sans">
            <aside className={`flex flex-col h-full transition-all duration-300 shrink-0 border-r w-[${collapsed ? '64px' : '220px'}]
            bg-background-dinamyc-general/90 border-background-dinamyc-general/25`}>
                <div className="flex items-center gap-3 px-4 py-5 border-b border-background-dinamyc-general/25">
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-background-buttons">
                        <i className="fa-solid fa-store size-4 text-background-emojis-color"/>
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-background-dinamyc-general/5">Stock Guard System</p>
                            <p className="text-xs truncate text-background-dinamyc-general/30">{user?.rol}</p>
                        </div>
                    )}
                </div>
                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                    {visibleNav.map(({to, icon: Icon, label}) => (
                        <NavLink 
                            to={to}
                            key={to}
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150
                            group ${isActive ? 'text-background-buttons bg-background-buttons/20' : 
                                'text-background-dinamyc-general/30 hover:text-background-dinamyc-general/5 hover:bg-background-dinamyc-general/15'}`}
                            title={collapsed ? label : undefined}
                            >
                            <i className={Icon + ' size-5 shrink-0'}/>
                            {!collapsed && <span className="">{label}</span>}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-2 pb-4 space-y-0.5 border-t pt-3 border-background-emojis-color-alert/60">
                    <button 
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full transition-all duration-150 
                    hover:bg-background-emojis-color-alert text-left text-background-emojis-color-alert/20"
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
                className={`absolute z-10 flex items-center justify-center w-5 h-10 rounded-r-md transition-all duration-300 
                hover:opacity-100 opacity-60 left-[${collapsed ? '64px' : '220px'}] top-[50%] transform-[translateY(-50%)] 
                bg-background-dinamyc-general/10 text-background-dinamyc-general/85`}
                >
                <i className={collapsed ? `fa-solid  fa-chevron-right size-3` : `fa-solid fa-chevron-left size-3`}/>
            </button>
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 bg-background-dinamyc-general">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;