import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import { setToken } from '../../utils/tokenManager';
import { isAuthenticated, getUserRole } from '../../utils/auth';
import { request } from 'graphql-request';
import { FaLeaf } from 'react-icons/fa';
import AuthButton from '../../components/ui/AuthButton';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import './styles/UserAuthPage.css';
import { gql, useMutation } from '@apollo/client';

const REGISTER_USER = gql`
  mutation RegisterUser($firstName: String!, $lastName: String!, $username: String!, $password: String!) {
    registerUser(firstName: $firstName, lastName: $lastName, username: $username, password: $password) {
      token
      user {
        id
        username
        firstName
        lastName
        role
      }
    }
  }
`;

const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        firstName
        lastName
        role
      }
    }
  }
`;

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
   const [registerUser] = useMutation(REGISTER_USER);
   const [loginUser] = useMutation(LOGIN_USER);

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
         const { data } = await registerUser({
            variables: {
               firstName,
               lastName,
               username,
               password,
            },
         });
         const { token, user } = data.registerUser;
         setToken(token);
         localStorage.setItem('user', JSON.stringify(user));
         toast.success('Signup successful!');
         navigate('/home?newUser=true', { replace: true }); // Ensure this is set correctly
      } catch (error) {
         console.error('Signup error:', error);
         toast.error(error.message || 'Signup failed. Please try again.');
      }
   };

   const handleLogin = async (e) => {
      e.preventDefault();
      try {
         const { data } = await loginUser({
            variables: {
               username: loginUsername,
               password: loginPassword,
            },
         });
         if (data.login) {
            const { token, user } = data.login;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'superadmin') {
               navigate('/superadmin/home', { replace: true });
            } else if (user.role === 'Chief_RPS') {
               navigate('/chief-rps/home', { replace: true });
            } else {
               navigate('/home?newUser=false', { replace: true }); // Ensure this is set correctly
            }
         } else {
            toast.error('Login failed');
         }
      } catch (error) {
         console.error('Login error:', error);
         toast.error(error.message || 'Login failed: Invalid credentials');
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
      </div>
   );
};

export default UserAuthPage;
