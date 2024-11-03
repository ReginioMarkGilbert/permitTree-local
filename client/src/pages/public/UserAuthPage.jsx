import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import { setToken } from '../../utils/tokenManager';
// import { isAuthenticated, getUserRole } from '../../utils/auth';
// import { request } from 'graphql-request';
import { FaLeaf } from 'react-icons/fa';
// import AuthButton from '../../components/ui/AuthButton';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
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
        roles
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
        roles
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
         navigate('/home?newUser=true', { replace: true });
      } catch (error) {
         console.error('Signup error:', error);
         toast.error(error.message || 'Signup failed. Please try again.');
      }
   };

   const handleLogin = async (e) => {
      e.preventDefault();
      if (!loginUsername || !loginPassword) {
         toast.error('Please fill in all required fields');
         return;
      }

      try {
         const { data } = await loginUser({
            variables: {
               username: loginUsername,
               password: loginPassword,
            },
         });
         if (data.login) {
            const { token, user } = data.login;
            setToken(token);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Login successful!');

            if (user.roles.includes('superadmin')) {
               navigate('/superadmin/home', { replace: true });
            } else if (user.roles.some(role => [
               'Chief_RPS',
               'Chief_TSD',
               'Technical_Staff',
               'Receiving_Clerk',
               'Releasing_Clerk',
               'Accountant',
               'OOP_Staff_Incharge',
               'Bill_Collector',
               'Credit_Officer',
               'PENR_CENR_Officer',
               'Deputy_CENR_Officer',
               'Inspection_Team'
            ].includes(role))) {
               navigate('/personnel/home', { replace: true });
            } else if (user.roles.includes('user')) {
               navigate('/home', { replace: true });
            } else {
               toast.error('Unknown user role');
               localStorage.removeItem('token');
               localStorage.removeItem('user');
            }
         }
      } catch (error) {
         console.error('Login error:', error);
         toast.error('Login failed: Invalid credentials');
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
               <div className="tabs-container w-full">
                  <div
                     className="tabs-list-container bg-gray-200 p-1 rounded-lg flex justify-between mb-4"
                     role="tablist"
                     aria-label="Authentication tabs"
                  >
                     <button
                        role="tab"
                        aria-selected={activeTab === 'signin'}
                        aria-controls="signin-panel"
                        id="signin-tab"
                        className={`tabs-trigger py-2 px-4 transition-all flex-1 rounded-md ${activeTab === 'signin' ? 'bg-white text-black shadow-md' : 'text-gray-500'
                           }`}
                        onClick={() => setActiveTab('signin')}
                     >
                        Sign In
                     </button>
                     <button
                        role="tab"
                        aria-selected={activeTab === 'signup'}
                        aria-controls="signup-panel"
                        id="signup-tab"
                        className={`tabs-trigger py-2 px-4 transition-all flex-1 rounded-md ${activeTab === 'signup' ? 'bg-white text-black shadow-md' : 'text-gray-500'
                           }`}
                        onClick={() => setActiveTab('signup')}
                     >
                        Sign Up
                     </button>
                  </div>
                  <div className="tabs-content">
                     <div
                        role="tabpanel"
                        id="signin-panel"
                        aria-labelledby="signin-tab"
                        style={{ display: activeTab === 'signin' ? 'block' : 'none' }}
                     >
                        <form className="space-y-4" onSubmit={handleLogin}>
                           <div className="space-y-2">
                              <Label htmlFor="login-username">Username</Label>
                              <Input
                                 id="login-username"
                                 data-testid="login-username"
                                 placeholder="john_doe"
                                 required
                                 value={loginUsername}
                                 onChange={(e) => setLoginUsername(e.target.value)}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="login-password">Password</Label>
                              <div className="input-container relative">
                                 <Input
                                    id="login-password"
                                    data-testid="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                 />
                                 <div className="flex items-center pt-2">
                                    <input
                                       type="checkbox"
                                       id="showPassword"
                                       checked={showPassword}
                                       onChange={() => setShowPassword(!showPassword)}
                                       className="mr-2"
                                    />
                                    <label htmlFor="showPassword" className="text-sm text-gray-600">
                                       Show password
                                    </label>
                                 </div>
                              </div>
                           </div>
                           <button
                              type="submit"
                              data-testid="signin-submit"
                              className="py-2 px-4 rounded w-full rounded-md text-white bg-green-600 hover:bg-green-700"
                           >
                              Sign In
                           </button>
                        </form>
                     </div>
                     <div
                        role="tabpanel"
                        id="signup-panel"
                        aria-labelledby="signup-tab"
                        style={{ display: activeTab === 'signup' ? 'block' : 'none' }}
                     >
                        <form className="space-y-4 pt-2" onSubmit={handleSignup}>
                           <div className="space-y-2">
                              <Label htmlFor="first-name">First name</Label>
                              <Input
                                 id="first-name"
                                 data-testid="first-name"
                                 placeholder="John"
                                 required
                                 value={firstName}
                                 onChange={(e) => setFirstName(e.target.value)}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="last-name">Last name</Label>
                              <Input
                                 id="last-name"
                                 data-testid="last-name"
                                 placeholder="Doe"
                                 required
                                 value={lastName}
                                 onChange={(e) => setLastName(e.target.value)}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="username">Generated Username</Label>
                              <Input
                                 id="username"
                                 data-testid="username"
                                 placeholder="john_doe"
                                 required
                                 value={username}
                                 readOnly
                              />
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <div className="input-container relative">
                                 <Input
                                    id="password"
                                    data-testid="signup-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                 />
                              </div>
                              {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm Password</Label>
                              <Input
                                 id="confirm-password"
                                 data-testid="confirm-password"
                                 type={showPassword ? 'text' : 'password'}
                                 required
                                 value={confirmPassword}
                                 onChange={(e) => setConfirmPassword(e.target.value)}
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
                           <button
                              type="submit"
                              data-testid="signup-submit"
                              className="w-full text-white bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md"
                           >
                              Sign Up
                           </button>
                           <p className="mt-4 text-center">
                              Already have an account?{' '}
                              <span onClick={() => setActiveTab('signin')} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                 Sign In
                              </span>
                           </p>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         </main>
         <footer className="py-6 text-center bg-green-800 text-white">
            <p className="text-sm">&copy; 2023 DENR-PENRO. All rights reserved.</p>
         </footer>
      </div>
   );
};

export default UserAuthPage;
