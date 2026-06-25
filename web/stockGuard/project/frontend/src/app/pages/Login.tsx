import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { request } from "@/api/request.config";

function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const {login} = useAuthStore();

    const handleLogin = async (e: React.SubmitEvent) => {
        e.preventDefault();
        
    }

    return (
        <div className="">
            <div className="">
                <div className="">
                    <div className="">
                        <i className=""></i>
                    </div>
                    <h1></h1>
                    <p></p>
                </div>
            </div>
        </div>
    );
}

export default Login;