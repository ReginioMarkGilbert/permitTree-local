import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showAlert, setShowAlert] = useState(false); // State to control alert visibility
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
                    // autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                const text = await response.text(); // Use text() instead of json() to handle non-JSON responses
                try {
                    const data = JSON.parse(text);
                    console.error('Login failed:', data);
                } catch (error) {
                    console.error('Login failed:', text);
                }
                toast.error('Login failed: Invalid credentials', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setShowAlert(true); // Show alert if login fails
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed: An error occurred', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setShowAlert(true); // Show alert if login fails
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Login</h1>
                {showAlert && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">User not found!</strong>
                        <span className="block sm:inline"> Please sign up.</span>
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Username or Phone Number"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                />
                <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
                <button onClick={handleGoogleLogin} className="w-full bg-red-500 text-white p-2 rounded mt-4">Login with Google</button>
                <p className="mt-4 text-center">Don't have an account? <Link to="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</Link></p>
            </div>
            <ToastContainer />
        </div>
    );
};

export default LoginPage;