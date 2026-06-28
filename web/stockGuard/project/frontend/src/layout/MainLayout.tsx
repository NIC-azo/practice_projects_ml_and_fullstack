import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { NavItems } from "@/types/typos.bd";

const MainLayout = () => {
    const {user, logout} = useAuthStore();

    const navItems: NavItems[] = [
        {to: '/dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard'},
        {to: '/pos', icon: 'fa-solid fa-cart-arrow-down', label: 'Punto de Ventas'},
        {to: '/products', icon: 'fa-solid fa-cart-flatbed', label: 'Productos'},
        {to: '/clients', icon: 'fa-solid fa-users', label: 'Clientes'},
        {to: '/users', icon: 'fa-solid fa-user-gear', label: 'Usuarios'},
        {to: '/history', icon: 'fa-solid fa-book', label: 'Historial'},
        {to: '/profile', icon: 'fa-circle-user', label: 'Perfil'}
    ]

    return (
        <div className="">
            <aside className="">
                <div className="">
                    
                </div>
            </aside>
        </div>
    );
};
