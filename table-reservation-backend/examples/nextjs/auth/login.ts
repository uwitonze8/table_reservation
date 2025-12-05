import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            // Assuming the response contains a token
            const { token } = response.data;

            // Store the token in local storage or context
            localStorage.setItem('token', token);

            // Redirect to the dashboard or home page
            router.push('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md">
                <h2 className="text-2xl mb-4">Login</h2>
                {error && <p className="text-red-500">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border rounded w-full py-2 px-3"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white rounded py-2 px-4">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;