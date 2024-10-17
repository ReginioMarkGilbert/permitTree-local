import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setToken } from '../../utils/tokenManager';
import { getUserRole } from '../../utils/auth';
import AuthButton from '../../components/ui/AuthButton';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { FaLeaf } from 'react-icons/fa';
import './styles/UserAuthPage.css';

const UserAuthPage = () => {
   const [activeTab, setActiveTab] = useState('signin');
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [loginUsername, setLoginUsername] = useState('');
   const [loginPassword, setLoginPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [passwordError, setPasswordError] = useState('');
   const navigate = useNavigate();

   useEffect(() => {
      if (firstName && lastName) {
         setUsername(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`);
      } else {
         setUsername('');
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

   const handleSignup = async (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
         toast.error('Passwords do not match.');
         return;
      }
      if (passwordError) {
         toast.error('Please correct the password as per requirements.');
         return;
      }
      try {
         const response = await axios.post('http://localhost:3000/api/signup', {
            firstName,
            lastName,
            username,
            password,
         });
         if (response.status === 201) {
            const data = response.data;
            setToken(data.token); // Use the new setToken function
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Signup successful!', {
               position: 'top-center',
               autoClose: 500,
               hideProgressBar: true,
               onClose: () => {
                  const userRole = getUserRole();
                  navigate(userRole === 'admin' ? '/admin' : '/home?newUser=true', { replace: true });
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
            username: loginUsername,
            password: loginPassword,
         });
         if (response.status === 200) {
            const data = response.data;
            setToken(data.token); // Use the new setToken function
            localStorage.setItem('user', JSON.stringify(data.user));
            const userRole = getUserRole();
            console.log(userRole);
            if (userRole === 'superadmin') {
               navigate('/superadmin/home', { replace: true });
            } else if (userRole === 'Chief_RPS') {
               navigate('/chief-rps/home', { replace: true });
            } else {
               navigate('/home?newUser=false', { replace: true });
            }
         } else {
            toast.error('Login failed: Invalid username or password');
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
               <Tabs defaultValue="signin" className="w-full">
                  <TabsList>
                     <TabsTrigger value="signin">Sign In</TabsTrigger>
                     <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin">
                     <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-2">
                           <Label htmlFor="login-username">Username</Label>
                           <Input id="login-username" placeholder="john_doe" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="password">Password</Label>
                           <div className="input-container relative">
                              <Input id="password-signin" required type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                              <div className="flex items-center pt-2">
                                 <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="mr-2" />
                                 <label htmlFor="showPassword" className="text-sm text-gray-600">Show password</label>
                              </div>
                           </div>
                        </div>
                        <AuthButton className="w-full rounded-md text-white bg-green-600 hover:bg-green-700">Sign In</AuthButton>
                        <p className="mt-4 text-center">Don't have an account? <span onClick={() => setActiveTab('signup')} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign Up</span></p>
                     </form>
                  </TabsContent>
                  <TabsContent value="signup">
                     <form className="space-y-4 pt-2" onSubmit={handleSignup}>
                        <div className="space-y-2">
                           <Label htmlFor="first-name">First name</Label>
                           <Input id="first-name" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="last-name">Last name</Label>
                           <Input id="last-name" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="username">Generated Username</Label>
                           <Input
                              id="username"
                              placeholder="john_doe"
                              required
                              value={username}
                              readOnly
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="password">Password</Label>
                           <div className="input-container relative">
                              <Input id="password" required type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} />
                           </div>
                           {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="confirm-password">Confirm Password</Label>
                           <Input id="confirm-password" required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                           <div className="flex items-center">
                              <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="mr-2" />
                              <label htmlFor="showPassword" className="text-sm text-gray-600">Show password</label>
                           </div>
                        </div>
                        <AuthButton className="w-full text-white bg-green-600 hover:bg-green-700">Sign Up</AuthButton>
                        <p className="mt-4 text-center">Already have an account? <span onClick={() => setActiveTab('signin')} className="text-blue-500 hover:text-blue-700 cursor-pointer">Sign In</span></p>
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
