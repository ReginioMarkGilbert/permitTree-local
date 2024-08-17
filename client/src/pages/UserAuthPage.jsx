import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setToken } from '../utils/auth';
import '../styles/UserAuthPage.css';

const UserAuthPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            : 'http://192.168.137.1:3000/api/signup'; // for mobile
            const response = await axios.post(apiUrl, {
                firstName, lastName, username, password, // Include username here
            });

            if (response.status === 201) {
                const data = response.data;
                setToken(data.token);
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
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
                        readOnly
                        className="w-full p-2 mb-4 border rounded input-field"
                    />
                    <label htmlFor="username" className="input-label">Generated Username</label>
                </div>

                {passwordError && <div className="text-red-500 text-sm mb-4">{passwordError}</div>}
                <div className="input-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full p-2 mb-4 border rounded input-field"
                    />
                    <label htmlFor="password" className="input-label">Password</label>
                </div>

                <div className="input-container">
                    <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 mb-2 border rounded input-field"
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
                <ToastContainer />
            </div>
        </div>
    );
};

export default UserAuthPage;