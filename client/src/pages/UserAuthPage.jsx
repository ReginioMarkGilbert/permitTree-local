import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setToken, getUserRole } from '../utils/auth';
import AuthButton from '../components/ui/AuthButton';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { FaLeaf } from 'react-icons/fa';
import '../styles/UserAuthPage.css';

const UserAuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Sign In
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [loginUsername, setLoginUsername] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleSwitchToSignup = () => {
        setIsSignUp(true);
        setPassword('');
        setConfirmPassword('');
    };

    const handleSwitchToSignIn = () => {
        setIsSignUp(false);
        setLoginEmail('');
        setLoginPassword('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:3000/api/signup', {
                firstName,
                lastName,
                email,
                password,
            });
            if (response.status === 201) {
                const data = response.data;
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Signup successful!', {
                    position: 'top-center',
                    autoClose: 500,
                    hideProgressBar: true,
                    onClose: () => {
                        const userRole = getUserRole();
                        navigate(userRole === 'admin' ? '/admin' : '/home', { replace: true });
                    },
                });
            } else {
                toast.error('Signup failed: An error occurred');
            }
        } catch (error) {
            toast.error('Signup failed: An error occurred');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email: loginEmail,
                password: loginPassword,
            });
            if (response.status === 200) {
                const data = response.data;
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Login successful!', {
                    position: 'top-center',
                    autoClose: 500,
                    hideProgressBar: true,
                    onClose: () => {
                        const userRole = getUserRole();
                        navigate(userRole === 'admin' ? '/admin' : '/home', { replace: true });
                    },
                });
            } else {
                toast.error('Login failed: Invalid email or password');
            }
        } catch (error) {
            toast.error('Login failed: An error occurred');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <header className="bg-white shadow-sm w-full">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link className="flex items-center justify-center" to="/">
                            <FaLeaf className="h-6 w-6 text-green-600" />
                            <span className="ml-2 text-xl font-bold text-green-800">PermitTree</span>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                    <Tabs defaultValue={isSignUp ? 'signup' : 'signin'} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="signup" onClick={() => setIsSignUp(true)} className={`py-2 px-4 text-center cursor-pointer rounded-tl-lg ${isSignUp ? 'bg-white border-b-2 border-green-600' : 'bg-gray-100'}`}>Sign Up</TabsTrigger>
                            <TabsTrigger value="signin" onClick={() => setIsSignUp(false)} className={`py-2 px-4 text-center cursor-pointer rounded-tr-lg ${!isSignUp ? 'bg-white border-b-2 border-green-600' : 'bg-gray-100'}`}>Sign In</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signup" activeTab={isSignUp ? 'signup' : 'signin'}>
                            <form className="space-y-4" onSubmit={handleSignup}>
                                <div className="space-y-2">
                                    <Label htmlFor="first-name">First name</Label>
                                    <Input id="first-name" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last-name">Last name</Label>
                                    <Input id="last-name" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="john@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="input-container relative">
                                        <Input id="password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input id="confirm-password" required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <div className="flex items-center">
                                        <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="mr-2" />
                                        <label htmlFor="showPassword" className="text-sm text-gray-600">Show password</label>
                                    </div>
                                </div>
                                <AuthButton className="w-full bg-green-600 hover:bg-green-700">Sign Up</AuthButton>
                                <p className="mt-4 text-center">Already have an account? <span onClick={handleSwitchToSignIn} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign In</span></p>
                            </form>
                        </TabsContent>
                        <TabsContent value="signin" activeTab={isSignUp ? 'signup' : 'signin'}>
                            <form className="space-y-4" onSubmit={handleLogin}>
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
                                <div className="space-y-2">
                                    <label htmlFor="password" className="input-label">Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full p-2 mb-4 border rounded input-field"
                                    />
                                    <div className="input-container relative">
                                        <Input id="password-signin" required type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                        <div className="flex items-center">
                                            <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="mr-2" />
                                            <label htmlFor="showPassword" className="text-sm text-gray-600">Show password</label>
                                        </div>
                                    </div>
                                </div>
                                <AuthButton className="w-full bg-green-600 hover:bg-green-700">Sign In</AuthButton>
                                <p className="mt-4 text-center">Don't have an account? <span onClick={() => setIsSignUp(true)} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign Up</span></p>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <footer className="py-6 text-center bg-green-800 text-white">
                <p className="text-sm">&copy; 2023 DENR-PENRO. All rights reserved.</p>
            </footer>
            <ToastContainer />
        </div>
    );
};

export default UserAuthPage;
