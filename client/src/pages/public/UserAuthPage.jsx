import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import { setToken } from '../../utils/tokenManager';
import { FaLeaf, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/Label';
import './styles/UserAuthPage.css';
import { gql, useMutation, useApolloClient } from '@apollo/client';

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
   const client = useApolloClient();

   useEffect(() => {
      if (firstName && lastName) {
         const formattedFirstName = firstName.trim().toLowerCase().replace(/\s+/g, '_');
         const formattedLastName = lastName.trim().toLowerCase();
         setUsername(`${formattedFirstName}_${formattedLastName}`);
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

      // Clear any existing validation errors
      const errors = [];

      // Validate required fields
      if (!loginUsername) {
         errors.push('Username is required');
      }
      if (!loginPassword) {
         errors.push('Password is required');
      }

      // Show validation errors if any
      if (errors.length > 0) {
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

            // Set token in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Force Apollo Client to reset its store
            await client.resetStore();

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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-green-100">
         <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
            <div className="container mx-auto px-4 sm:px-6">
               <div className="flex items-center justify-between h-16">
                  <Link
                     className="flex items-center justify-center group hover:scale-105 transition-transform"
                     to="/"
                  >
                     <FaLeaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 group-hover:text-green-700" />
                     <span className="ml-2 text-lg sm:text-xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                        PermitTree
                     </span>
                  </Link>
               </div>
            </div>
         </header>
         <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 pb-10">
            <div className="w-full max-w-[420px] p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
               <div className="tabs-container w-full">
                  <div
                     className="tabs-list-container bg-gray-100/80 p-1 rounded-xl flex justify-between mb-8"
                     role="tablist"
                     aria-label="Authentication tabs"
                  >
                     <button
                        role="tab"
                        aria-selected={activeTab === 'signin'}
                        aria-controls="signin-panel"
                        id="signin-tab"
                        className={`tabs-trigger py-1 px-6 transition-all duration-200 flex-1 rounded-lg text-sm sm:text-base font-medium
                  ${activeTab === 'signin'
                              ? 'bg-white text-green-700 shadow-md'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'}`}
                        onClick={() => setActiveTab('signin')}
                     >
                        Sign In
                     </button>
                     <button
                        role="tab"
                        aria-selected={activeTab === 'signup'}
                        aria-controls="signup-panel"
                        id="signup-tab"
                        className={`tabs-trigger py-1 px-6 transition-all duration-200 flex-1 rounded-lg text-sm sm:text-base font-medium
                  ${activeTab === 'signup'
                              ? 'bg-white text-green-700 shadow-md'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'}`}
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
                        className="space-y-4"
                        style={{ display: activeTab === 'signin' ? 'block' : 'none' }}
                     >
                        <div>
                           <Label htmlFor="loginUsername" className="text-sm font-medium text-gray-700">
                              Username
                           </Label>
                           <Input
                              id="loginUsername"
                              data-testid="login-username"
                              type="text"
                              value={loginUsername}
                              onChange={(e) => setLoginUsername(e.target.value)}
                              className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              placeholder="Enter your username"
                           />
                        </div>
                        <div>
                           <Label htmlFor="loginPassword" className="text-sm font-medium text-gray-700">
                              Password
                           </Label>
                           <div className="relative">
                              <Input
                                 id="loginPassword"
                                 data-testid="login-password"
                                 type={showPassword ? "text" : "password"}
                                 value={loginPassword}
                                 onChange={(e) => setLoginPassword(e.target.value)}
                                 className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                 placeholder="Enter your password"
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                 {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                              </button>
                           </div>
                        </div>
                        <button
                           onClick={handleLogin}
                           data-testid="signin-submit"
                           className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2.5 px-4 rounded-lg font-medium
                    hover:from-green-700 hover:to-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                           Sign In
                        </button>
                     </div>
                     <div
                        role="tabpanel"
                        id="signup-panel"
                        aria-labelledby="signup-tab"
                        className="space-y-4"
                        style={{ display: activeTab === 'signup' ? 'block' : 'none' }}
                     >
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                                 First Name
                              </Label>
                              <Input
                                 id="firstName"
                                 data-testid="first-name"
                                 type="text"
                                 value={firstName}
                                 onChange={(e) => setFirstName(e.target.value)}
                                 className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                 placeholder="First name"
                              />
                           </div>
                           <div>
                              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                                 Last Name
                              </Label>
                              <Input
                                 id="lastName"
                                 data-testid="last-name"
                                 type="text"
                                 value={lastName}
                                 onChange={(e) => setLastName(e.target.value)}
                                 className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                 placeholder="Last name"
                              />
                           </div>
                        </div>
                        <div>
                           <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                              Username
                           </Label>
                           <Input
                              id="username"
                              data-testid="username"
                              type="text"
                              value={username}
                              readOnly
                              className="mt-1 w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              placeholder="Username will be generated"
                           />
                        </div>
                        <div>
                           <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                              Password
                           </Label>
                           <div className="relative">
                              <Input
                                 id="password"
                                 data-testid="signup-password"
                                 type={showPassword ? "text" : "password"}
                                 value={password}
                                 onChange={handlePasswordChange}
                                 className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                 placeholder="Create a password"
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                 {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                              </button>
                           </div>
                           {passwordError && (
                              <p className="mt-2 text-sm text-red-600">
                                 {passwordError}
                              </p>
                           )}
                        </div>
                        <div>
                           <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                              Confirm Password
                           </Label>
                           <Input
                              id="confirmPassword"
                              data-testid="confirm-password"
                              type={showPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              placeholder="Confirm your password"
                           />
                        </div>
                        <button
                           onClick={handleSignup}
                           data-testid="signup-submit"
                           className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2.5 px-4 rounded-lg font-medium
                    hover:from-green-700 hover:to-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                           Sign Up
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </main>
         <footer className="py-4 sm:py-6 text-center bg-green-800 text-white">
            <p className="text-xs sm:text-sm">&copy; 2023 DENR-PENRO. All rights reserved.</p>
         </footer>
      </div>
   );
};

export default UserAuthPage;
