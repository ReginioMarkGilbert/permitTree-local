import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FaBell, FaClipboardList, FaFileAlt, FaHome, FaSignInAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import permitTreeLogo from '@/assets/denr-logo.png';
import { isAuthenticated } from '@/utils/auth';
import { removeToken } from '@/utils/tokenManager';
import { gql, useMutation } from '@apollo/client';
import { X } from 'lucide-react';

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

   const mainNavItems = useMemo(() => [
      { to: '/home', icon: <FaHome />, text: 'Home' },
      { to: '/permits', icon: <FaFileAlt />, text: 'Apply' },
      { to: '/applicationsStatus', icon: <FaClipboardList />, text: 'Application Status' },
      { to: '/notifications', icon: <FaBell />, text: 'Notifications' },
   ], []);

   const accountNavItems = useMemo(() => [
      { to: '/profile', icon: <FaUser />, text: 'Profile' },
      { to: '/auth', icon: <FaSignOutAlt />, text: 'Logout' }
   ], []);

   const renderNavItem = (item, index) => (
      <NavLink
         key={index}
         to={item.to}
         className={({ isActive }) => `
            flex items-center py-2.5 px-3 rounded-md mt-1.5
            ${isOpen ? '' : 'justify-center'}
            transition-all duration-200 ease-in-out
            ${isActive && item.to !== '/auth'
               ? 'bg-green-700 text-white'
               : 'hover:bg-green-700/50 hover:text-white'}
            group
         `}
         onClick={item.to === '/auth' ? handleLogout : undefined}
      >
         <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="transition-transform duration-200 group-hover:scale-105">
               {item.icon}
            </span>
            {item.badge > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {item.badge}
               </span>
            )}
         </div>
         {isOpen && (
            <span className={`ml-3 font-medium text-sm transition-opacity duration-300
               ${showText ? 'opacity-100' : 'opacity-0'}`}>
               {item.text}
            </span>
         )}
      </NavLink>
   );

   if (!isAuth) {
      return null;
   }

   return (
      <>
         {/* Backdrop - only shows on mobile when sidebar is open */}
         {isOpen && (
            <div
               className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity"
               onClick={onToggle}
            />
         )}

         {/* Sidebar */}
         <div
            className={`h-full bg-green-800 text-white flex flex-col fixed top-0 left-0
               ${isOpen ? 'w-64' : 'w-16'}
               transition-all duration-300 ease-in-out
               border-r border-green-700
               lg:z-10 z-30
               ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
         >
            <div className="flex flex-col flex-grow">
               {/* Logo Section with Close Button for Mobile */}
               <div className={`flex items-center p-4 mb-4 border-b border-green-700 h-16
                  ${isOpen ? 'justify-between' : 'justify-center'}`}>
                  <div className="flex items-center">
                     <img
                        src={permitTreeLogo}
                        alt="PermitTree Logo"
                        className="w-8 h-8"
                     />
                     {isOpen && (
                        <span className={`ml-3 font-semibold text-lg transition-opacity duration-300
                           ${showText ? 'opacity-100' : 'opacity-0'}`}>
                           PermitTree
                        </span>
                     )}
                  </div>
                  {/* Close button - only visible on mobile when sidebar is open */}
                  {isOpen && (
                     <button
                        onClick={onToggle}
                        className="lg:hidden p-1 rounded-lg hover:bg-green-700 transition-colors"
                     >
                        <X className="h-6 w-6" />
                     </button>
                  )}
               </div>

               {/* Main Navigation */}
               <nav className="flex-grow px-3">
                  {mainNavItems.map((item, index) => renderNavItem(item, index))}
               </nav>

               {/* Account Navigation */}
               <div className="mt-auto">
                  <div className="px-3 mb-8">
                     <div className="border-t border-green-700 my-2"></div>
                     {accountNavItems.map((item, index) => renderNavItem(item, index))}
                  </div>
               </div>


            </div>
         </div>
      </>
   );
});

export default Sidebar;
