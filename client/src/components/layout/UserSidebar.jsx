import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FaBell, FaClipboardList, FaFileAlt, FaHome, FaSignInAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import permitTreeLogo from '../../assets/denr-logo.png';
import { isAuthenticated } from '../../utils/auth';
import { removeToken } from '../../utils/tokenManager';
import { gql, useMutation } from '@apollo/client';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const Sidebar = React.memo(({ isOpen, onToggle }) => {
   const navigate = useNavigate();
   const [logout] = useMutation(LOGOUT_MUTATION);
   const [showText, setShowText] = useState(false);
   const [isAuth, setIsAuth] = useState(isAuthenticated());

   useEffect(() => {
      if (isOpen) {
         const timer = setTimeout(() => setShowText(true), 150);
         return () => clearTimeout(timer);
      } else {
         setShowText(false);
      }
   }, [isOpen]);

   const handleLogout = useCallback(async () => {
      try {
         await logout();
         removeToken();
         localStorage.removeItem('user');
         setIsAuth(false);
         if (isOpen) {
            onToggle(); // Close the sidebar if it's open
         }
         navigate('/auth');
         console.log('Logout successful!');
      } catch (error) {
         console.error('Logout failed:', error);
      }
   }, [logout, navigate, isOpen, onToggle]);

   useEffect(() => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);
      if (!authStatus) {
         if (isOpen) {
            onToggle(); // Close the sidebar if it's open
         }
         navigate('/auth');
      }
   }, [navigate, isOpen, onToggle]);

   const navItems = [
      { to: '/home', icon: <FaHome />, text: 'Home' },
      { to: '/permits', icon: <FaFileAlt />, text: 'Apply' },
      { to: '/applicationsStatus', icon: <FaClipboardList />, text: 'Application Status' },
      { to: '/notifications', icon: <FaBell />, text: 'Notifications' },
      { to: '/profile', icon: <FaUser />, text: 'Profile' },
      { to: '/auth', icon: <FaSignOutAlt />, text: 'Logout' }
   ];

   const renderNavItem = (item, index) => (
      <NavLink
         key={index}
         to={item.to}
         className={({ isActive }) => `
            flex items-center py-2.5 px-4 rounded-md mt-2
            ${isOpen ? '' : 'justify-center'}
            ${isActive && item.to !== '/auth' ? 'bg-green-700 text-white' : 'hover:bg-gray-700 hover:text-white'}
         `}
         onClick={item.to === '/auth' ? handleLogout : undefined}
      >
         <div className="relative w-6 h-6 flex items-center justify-center">
            {item.badge > 0 && (
               <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {item.badge}
               </span>
            )}
            {item.icon}
         </div>
         {isOpen && (
            <span className={`ml-3 transition-opacity duration-450 ease-in-out ${showText ? 'opacity-100' : 'opacity-0'}`}>
               {item.text}
            </span>
         )}
      </NavLink>
   );

   if (!isAuth) {
      return null;
   }

   return (
      <div
         className={`h-full bg-green-800 text-white flex flex-col justify-between fixed top-0 left-0 ${isOpen ? 'w-48 md:w-64' : 'w-16'
            } z-10 transition-all duration-300 ease-in-out`}
      >
         <div className="flex flex-col h-full">
            {/* Add a spacer div to replace the logo */}
            <div className="h-20"></div>
            {/* <div className={`h-20 flex items-center justify-center ${isOpen ? 'px-4' : ''}`}>
               {isOpen ? (
                  <div className="flex items-center">
                     <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                     <span className={`pl-2 text-xl font-semibold transition-opacity duration-300 ease-in-out ${showText ? 'opacity-100' : 'opacity-0'}`}>
                        PermitTree
                     </span>
                  </div>
               ) : (
                  <img src={permitTreeLogo} alt="PermitTree Logo" className="h-8 w-8" />
               )}
            </div> */}
            <nav className="flex-grow mt-6">
               {navItems.slice(0, 4).map(renderNavItem)}
            </nav>
            <div className="mb-10">
               {isOpen && (
                  <>
                     <div className="line mx-4" style={{ borderBottom: '1px solid #ffffff', marginBottom: '1em' }}></div>
                     <h2 className={`px-4 text-sm text-white uppercase mb-2 transition-opacity duration-300 ease-in-out ${showText ? 'opacity-100' : 'opacity-0'}`}>
                        Account Pages
                     </h2>
                  </>
               )}
               {navItems.slice(4).map(renderNavItem)}
            </div>
         </div>
      </div>
   );
});

export default Sidebar;
