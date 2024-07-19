import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setToken } from '../utils/auth';
import '../styles/UserAuthPage.css'; // Import the CSS file

const UserAuthPage = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginIdentifier, password }) // Use loginIdentifier instead of separate username and email
            });

            if (response.status === 200) {
                const data = response.data;
                setToken(data.token); // Store the token
                toast.success('Login successful!', {
                    position: "top-center",
                    autoClose: 500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClose: () => navigate('/home') // Navigate to home page after autoClose toast
                });
            } else {
                toast.error(`Login failed: ${response.data.message}`);
            }
        } catch (error) {
            toast.error('Login failed: An error occurred');
        }
    };

    const handleSignup = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/signup', {
                email, username, password, phone, firstName, lastName
            });

            if (response.status === 201) {
                const data = response.data;
                setToken(data.token); // Store the token
                toast.success('Signup successful!', {
                    position: "top-center",
                    autoClose: 500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClose: () => navigate('/home') // Navigate to home page after autoClose toast
                });
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
                        <div className="input-container">
                            <input
                                type="text"
                                id="loginIdentifier"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <label htmlFor="loginIdentifier" className="input-label">Username or Gmail</label>
                        </div>
                        <div className="input-container">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <label htmlFor="password" className="input-label">Password</label>
                        </div>
                        <button onClick={() => { handleLogin(); setIsLogin(true); }} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
                        <button onClick={handleGoogleLogin} className="w-full bg-red-500 text-white p-2 rounded mt-4">Login with Google</button>
                        <p className="mt-4 text-center">Don't have an account? <span onClick={() => setIsLogin(false)} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign Up</span></p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
                        <div className="flex justify-between space-x-4">
                            <div className="input-container w-1/2">
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded input-field"
                                />
                                <label htmlFor="firstName" className="input-label">First Name</label>
                            </div>
                            <div className="input-container w-1/2">
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded input-field"
                                />
                                <label htmlFor="lastName" className="input-label">Last Name</label>
                            </div>
                        </div>
                        <div className="input-container">
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 mb-2 border rounded input-field"
                                placeholder="e.g. johnDoe12"
                            />
                            <label htmlFor="username" className="input-label">Username</label>
                        </div>
                        <div className="input-container">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <label htmlFor="email" className="input-label">Email</label>
                        </div>
                        <div className="input-container">
                            <input
                                type="password"
                                id="passwordSignup"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <label htmlFor="passwordSignup" className="input-label">Password</label>
                        </div>
                        <div className="input-container">
                            <input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <label htmlFor="phone" className="input-label">Phone Number</label>
                        </div>
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
