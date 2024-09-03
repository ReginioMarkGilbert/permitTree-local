import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setToken, getUserRole } from '../utils/auth';
import './styles/UserAuthPage.css';


const UserAuthPage = () => {
    // Signup
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Login
    const [loginUsername, setLoginUsername] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (firstName && lastName) {
            setUsername(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`);
        } else {
            setUsername(''); // This will clear the username if firstName or lastName is empty
        }
    }, [firstName, lastName]);

    const validatePassword = (password) => {
        let errors = [];
        if (!/[A-Z]/.test(password)) errors.push("Password must include at least one uppercase letter.");
        if (!/[0-9]/.test(password)) errors.push("Password must include at least one number.");
        if (password.length < 8) errors.push("Password must be at least 8 characters long.");
        setPasswordError(errors.join(' '));
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
    };

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (passwordError) {
            toast.error('Please correct the password as per requirements.');
            return;
        }
        try {
            const apiUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3000/api/signup'
                : window.location.hostname === '192.168.1.12'
                    ? 'http://192.168.1.12:3000/api/signup' // for other laptop
                    : window.location.hostname === '192.168.1.15'
                        ? 'http://192.168.1.15:3000/api/signup' // for new url
                        : 'http://192.168.137.1:3000/api/signup'; // for mobile
            const response = await axios.post(apiUrl, {
                firstName, lastName, username, password,
            });

            if (response.status === 201) {
                const data = response.data;
                setToken(data.token);
                // console.log('Token immediately after setting:', localStorage.getItem('token')); // Debugging line
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(`Signup successful!`, {
                    position: "top-center",
                    autoClose: 500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClose: () => navigate('/home')
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

    const handleLogin = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3000/api/login'
                : window.location.hostname === '192.168.1.12'
                    ? 'http://192.168.1.12:3000/api/login'
                    : window.location.hostname === '192.168.1.15'
                        ? 'http://192.168.1.15:3000/api/login'
                        : 'http://192.168.137.1:3000/api/login';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: loginUsername, password })
            });

            if (response.status === 200) {
                const data = await response.json();
                setToken(data.token);

                const userRole = getUserRole(); // Fetch the role from the token
                toast.success('Login successful!', {
                    position: "top-center",
                    autoClose: 500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false,
                    style: {
                        width: '200px',
                        fontSize: '16px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    },
                    // onClose: () => navigate('/home')
                    onClose: () => {
                        navigate(userRole === 'admin' ? '/admin' : '/home'); // if admin, navigate to admin page, else (if user) navigate to home page
                    }
                });
            } else {
                const errorData = await response.json();
                toast.error(`Login failed: ${errorData.message}`);
            }
        } catch (error) {
            console.log("Login Error: ", error);
            toast.error('Login failed: An error occurred');
        }
    };


    const handleSwitchToSignup = () => {
        setIsLogin(false);
        setPassword('');
        setConfirmPassword('');
    };

    const handleSwitchToLogin = () => {
        setIsLogin(true);
        setPassword('');
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
                                id="loginUsername"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <label htmlFor="loginUsername" className="input-label">Username</label>
                        </div>
                        <div className="input-container relative">
                            <label htmlFor="password" className="input-label">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="showPassword"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="mr-2"
                                />
                                <label htmlFor="showPassword" className="text-sm text-gray-600">Show password</label>
                            </div>

                        </div>
                        <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
                        <p className="mt-4 text-center">Don't have an account? <span onClick={handleSwitchToSignup} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign Up</span></p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
                        <div className="flex justify-between space-x-4">
                            <div className="input-container w-1/2">
                                <label htmlFor="firstName" className="input-label">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded input-field"
                                />
                            </div>

                            <div className="input-container w-1/2">
                                <label htmlFor="lastName" className="input-label">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded input-field"
                                />
                            </div>
                        </div>

                        <div className="input-container">
                            <label htmlFor="username" className="input-label">Generated Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                // readOnly
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                        </div>

                        {passwordError && <div className="text-red-500 text-sm mb-4">{passwordError}</div>}

                        <div className="input-container">
                            <label htmlFor="passwordSignup" className="input-label">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="passwordSignup"
                                value={password}
                                onChange={handlePasswordChange}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                        </div>

                        <div className="input-container">
                            <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 mb-4 border rounded input-field"
                            />
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="showPassword"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="mr-2"
                                />
                                <label htmlFor="showPassword" className="text-sm text-gray-600">Show password</label>
                            </div>
                        </div>

                        <button onClick={handleSignup} className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
                        <p className="mt-4 text-center">Already have an account? <span onClick={handleSwitchToLogin} className="text-blue-500 hover:text-blue-700 cursor-pointer">Login</span></p>
                    </>
                )}
                <ToastContainer />
            </div>
        </div>
    );
};

export default UserAuthPage;
