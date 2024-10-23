import React, { useCallback, useMemo } from 'react';
import { FaBell, FaChartLine, FaCog, FaFileInvoiceDollar, FaHome, FaSignInAlt, FaTachometerAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import permitTreeLogo from '../../../assets/denr-logo.png';
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

   console.log("user roles:", userRoles);

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

   const sidebarLinks = useMemo(() => [
      { to: "/personnel/home", icon: <FaHome />, text: "Home" },
      { to: getDashboardLink(), icon: <FaTachometerAlt />, text: "Dashboard" },
      { to: "/personnel/notifications", icon: <FaBell />, text: "Notifications", count: unreadCount },
      { to: "/personnel/reports", icon: <FaChartLine />, text: "Reports" },
      { to: "/personnel/settings", icon: <FaCog />, text: "Settings" },
      { to: "/personnel/order-of-payment", icon: <FaFileInvoiceDollar />, text: "Order of Payment" },
   ], [unreadCount, userRoles]);

   const sidebarContent = useMemo(() => (
      <>
         <div className="mt-6 ml-4">
            <div className="mt-16">
               <div className="flex items-center justify-start mt-10 mr-5 pl-2">
                  <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                  <span className="pl-2 text-xl font-semibold">PermitTree</span>
               </div>
               <div className="line" style={{ borderBottom: '1px solid #ffffff', marginTop: '20px', width: '190px' }}></div>
               <nav className="mt-7">
                  {sidebarLinks.map((link) => (
                     <NavLink key={link.to} to={link.to} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2 relative">
                        <span className="mr-3 relative">
                           {link.icon}
                           {link.count > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                 {link.count}
                              </span>
                           )}
                        </span>
                        <span>{link.text}</span>
                     </NavLink>
                  ))}
               </nav>
            </div>
         </div>
         <div className="line ml-4" style={{ borderBottom: '1px solid #ffffff', marginTop: '22.5em', width: '190px' }}></div>
         <div className="mb-10 ml-4">
            <NavLink to="#" onClick={handleLogout} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
               <span className="mr-3"><FaSignInAlt /></span>
               <span>Logout</span>
            </NavLink>
         </div>
      </>
   ), [sidebarLinks, handleLogout]);

   return (
      <div
         className={`h-full bg-green-800 text-white flex flex-col justify-between fixed top-0 left-0 w-56 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:w-64 z-10`}
         style={{ willChange: 'transform' }}
      >
         {sidebarContent}
      </div>
   );
});

export default PersonnelSidebar;
