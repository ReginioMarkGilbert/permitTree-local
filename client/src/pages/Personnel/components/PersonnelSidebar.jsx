import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FaBell, FaChartLine, FaCog, FaFileInvoiceDollar, FaHome, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../../../utils/tokenManager';
import { useChiefRPSNotification } from '../contexts/ChiefRPSNotificationContext';
import { isAuthenticated, getUserRoles } from '../../../utils/auth';
import { gql, useMutation } from '@apollo/client';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const PersonnelSidebar = React.memo(({ isOpen }) => {
   const navigate = useNavigate();
   const { unreadCount } = useChiefRPSNotification();
   const [logout] = useMutation(LOGOUT_MUTATION);
   const userRoles = getUserRoles();
   const [showText, setShowText] = useState(false);

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
         navigate('/auth');
         console.log('Logout successful!');
      } catch (error) {
         console.error('Logout failed:', error);
      }
   }, [logout, navigate]);

   React.useEffect(() => {
      const authStatus = isAuthenticated();
      if (!authStatus) {
         navigate('/auth');
      }
   }, [navigate]);

   const getDashboardLink = () => {
      if (userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
         return "/personnel/receiving-releasing";
      } else if (userRoles.includes('Technical_Staff')) {
         return "/personnel/technical-staff";
      } else if (userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD')) {
         return "/personnel/chief";
      } else if (userRoles.includes('Accountant')) {
         return "/personnel/accountant";
      } else if (userRoles.includes('Bill_Collector')) {
         return "/personnel/bill-collector";
      } else if (userRoles.includes('PENR_CENR_Officer')) {
         return "/personnel/penr-cenr-officer";
      } else {
         return "/personnel/dashboard";
      }
   };

   const navItems = [
      { to: "/personnel/home", icon: <FaHome />, text: "Home" },
      { to: getDashboardLink(), icon: <FaTachometerAlt />, text: "Dashboard" },
      { to: "/personnel/notifications", icon: <FaBell />, text: "Notifications", badge: unreadCount },
      { to: "/personnel/reports", icon: <FaChartLine />, text: "Reports" },
      { to: "/personnel/settings", icon: <FaCog />, text: "Settings" },
      { to: "/personnel/order-of-payment", icon: <FaFileInvoiceDollar />, text: "Order of Payment" },
      { to: "/auth", icon: <FaSignOutAlt />, text: "Logout" }
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

   if (!isAuthenticated()) {
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
            <nav className="flex-grow">
               {navItems.slice(0, -1).map(renderNavItem)}
            </nav>
            <div className="mb-10">
               {isOpen && (
                  <div className="line mx-4" style={{ borderBottom: '1px solid #ffffff', marginBottom: '1em' }}></div>
               )}
               {renderNavItem(navItems[navItems.length - 1])}
            </div>
         </div>
      </div>
   );
});

export default PersonnelSidebar;
