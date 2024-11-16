import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FaBell, FaChartLine, FaCog, FaFileInvoiceDollar, FaHome, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../../../utils/tokenManager';
import { isAuthenticated, getUserRoles } from '../../../utils/auth';
import { gql, useMutation } from '@apollo/client';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const PersonnelSidebar = React.memo(({ isOpen, onToggle }) => {
   const navigate = useNavigate();
   const [logout] = useMutation(LOGOUT_MUTATION);
   const userRoles = getUserRoles();
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

   const getDashboardLink = () => {
      if (userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
         return "/personnel/receiving-releasing";
      } else if (userRoles.includes('Technical_Staff') || userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
         return "/personnel/technical-staff";
      } else if (userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD')) {
         return "/personnel/chief";
      } else if (userRoles.includes('Accountant') || userRoles.includes('OOP_Staff_Incharge')) {
         return "/personnel/accountant";
      } else if (userRoles.includes('Bill_Collector') || userRoles.includes('Credit_Officer')) {
         return "/personnel/bill-collector";
      } else if (userRoles.includes('PENR_CENR_Officer') || userRoles.includes('Deputy_CENR_Officer')) {
         return "/personnel/penr-cenr-officer";
      } else if (userRoles.includes('Inspection_Team')) {
         return "/personnel/inspection-team";
      } else {
         console.log('No role found');
         return "/personnel/dashboard";
      }
   };

   const shouldShowOrderOfPayment = () => {
      return userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD');
   };

   const mainNavItems = useMemo(() => [
      { to: "/personnel/home", icon: <FaHome />, text: "Home" },
      { to: getDashboardLink(), icon: <FaTachometerAlt />, text: "Dashboard" },
      ...(shouldShowOrderOfPayment() ? [{ to: "/personnel/order-of-payment", icon: <FaFileInvoiceDollar />, text: "Order of Payment" }] : []),
      { to: "/personnel/notifications", icon: <FaBell />, text: "Notifications" },
      { to: "/personnel/reports", icon: <FaChartLine />, text: "Reports" },
   ], [getDashboardLink, shouldShowOrderOfPayment]);

   const accountNavItems = useMemo(() => [
      { to: "/personnel/settings", icon: <FaCog />, text: "Settings" },
      { to: "/auth", icon: <FaSignOutAlt />, text: "Logout" }
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
      <div
         className={`h-full bg-green-800 text-white flex flex-col fixed top-0 left-0 
            ${isOpen ? 'w-64' : 'w-16'} z-10 transition-all duration-300 ease-in-out
            border-r border-green-700`}
      >
         <div className="flex flex-col flex-grow">
            {/* Logo Section */}
            <div className={`flex items-center p-4 mb-4 border-b border-green-700 h-16 
               ${isOpen ? 'justify-start' : 'justify-center'}`}>
               <div className={`transition-all duration-300 text-2xl font-bold
                  ${isOpen ? 'w-8 h-8' : 'w-8 h-8'}`}>
                  P
               </div>
               {isOpen && (
                  <span className={`ml-3 font-semibold text-lg transition-opacity duration-300 
                     ${showText ? 'opacity-100' : 'opacity-0'}`}>
                     Personnel
                  </span>
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
   );
});

export default PersonnelSidebar;
