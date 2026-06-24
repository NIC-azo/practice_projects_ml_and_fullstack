import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { request } from "@/api/request.config";


function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async (e: React.SubmitEvent) => {
        e.preventDefault();
        
    }
}

export default Login;