import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserAuthPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [login, setLogin] = useState('');
    const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: login, password })
            });
            if (response.ok) {
                toast.success('Login successful!', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClose: () => navigate('/home') // Navigate to home page after autoClose toast
                });
            } else {
                toast.error('Login failed: Invalid credentials');
            }
        } catch (error) {
            toast.error('Login failed: An error occurred');
        }
    };

    const handleSignup = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/signup', {
                email, username, password, phone
            });
            if (response.status === 201) {
                toast.success('Signup successful!');
                navigate('/');
            } else {
                toast.error('Signup failed: An error occurred');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(`Signup failed: ${error.response.data.message}`);
            } else {
                toast.error('Signup failed: An error occurred');
            }
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    const handleGoogleSignup = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">

                {isLogin ? (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Login</h1>
                        <input type="text" placeholder="Username or Phone Number" value={login} onChange={(e) => setLogin(e.target.value)} className="w-full p-2 mb-4 border rounded" />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" />
                        <button onClick={() => { handleLogin(); setIsLogin(true); }} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
                        <button onClick={handleGoogleLogin} className="w-full bg-red-500 text-white p-2 rounded mt-4">Login with Google</button>
                        <p className="mt-4 text-center">Don't have an account? <span onClick={() => setIsLogin(false)} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign Up</span></p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <button onClick={handleSignup} className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
                        <button onClick={handleGoogleSignup} className="w-full bg-red-500 text-white p-2 rounded mt-4">Sign Up with Google</button>
                        <p className="mt-4 text-center">Already have an account? <span onClick={() => setIsLogin(true)} className="text-blue-500 hover:text-blue-700 cursor-pointer">Login</span></p>
                    </>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default UserAuthPage;
