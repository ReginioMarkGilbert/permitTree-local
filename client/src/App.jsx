import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/layout/Navbar';
import UserSidebar from './components/layout/UserSidebar';
import useSidebarToggle from './hooks/useSidebarToggle';
import HomePage from './pages/user/HomePage';
import UserProfilePage from './pages/user/UserProfilePage';
import PermitsPage from './pages/user/permitsPage';
import UserApplicationsPage from './pages/user/UserApplicationsStatusPage';
import ApplicationForm from './pages/user/ApplicationForm';
import UserAuthPage from './pages/public/UserAuthPage';
import UserNotificationsPage from './pages/user/UserNotificationsPage';
import NotificationProvider from './pages/user/contexts/UserNotificationContext';

import LandingPage from './pages/public/LandingPage';
import LearnMorePage from './pages/public/LearnMorePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';

import PersonnelSidebar from './pages/Personnel/components/PersonnelSidebar';
import PersonnelHomePage from './pages/Personnel/PersonnelHomePage';
import ChiefRPSReportsPage from './pages/Personnel/ChiefRPSReportsPage';
import PersonnelSettingsPage from './pages/Personnel/PersonnelSettingsPage';
import ChiefRPSApplicationReviewModal from './pages/Personnel/components/ChiefRPSApplicationReviewModal';
import ChiefRPSApplicationViewModal from './pages/Personnel/components/ChiefRPSApplicationViewModal';

import { isAuthenticated, getUserRoles } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SuperAdminSidebar from './pages/SuperAdmin/SuperAdminSidebar';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import SuperAdminHomePage from './pages/SuperAdmin/SuperAdminHomePage';
import SuperAdminManageUsersPage from './pages/SuperAdmin/SuperAdminManageUsersPage';
import SuperAdminReportsPage from './pages/SuperAdmin/SuperAdminReportsPage';
import SuperAdminSettingsPage from './pages/SuperAdmin/SuperAdminSettingsPage';
import ChiefRPSNotificationPage from './pages/Personnel/ChiefRPSNotificationPage';
import ChiefRPSNotificationProvider from './pages/Personnel/contexts/ChiefRPSNotificationContext';

import { checkTokenExpiration } from './utils/tokenManager';
import ChiefRPSorderOfPaymentPage from './pages/Personnel/ChiefRPSorderOfPaymentPage';

import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

import { Toaster } from 'sonner';

import PersonnelDashboard from './pages/Personnel/PersonnelDashboard';

const App = () => {
   const { sidebarToggle, toggleSidebar } = useSidebarToggle();
   const navigate = useNavigate();
   const location = useLocation();
   const [userRoles, setUserRoles] = useState([]);
   const [showNavbar, setShowNavbar] = useState(false);

   useEffect(() => {
      const authStatus = isAuthenticated();
      if (authStatus) {
         setUserRoles(getUserRoles());
      } else if (location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/about' && location.pathname !== '/services' && location.pathname !== '/contact' && location.pathname !== '/learnMore') {
         navigate('/auth');
      }
      setShowNavbar(authStatus && location.pathname !== '/');
   }, [navigate, location.pathname]);

   useEffect(() => {
      const intervalId = setInterval(() => {
         checkTokenExpiration(navigate);
      }, 60000); // Check every minute

      return () => clearInterval(intervalId);
   }, [navigate]);

   const PersonnelRoles = ['Chief_RPS', 'Chief_TSD', 'Technical_Staff', 'Receiving_Clerk', 'Releasing_Clerk', 'Accountant', 'Bill_Collector', 'PENR_CENR_Officer'];

   const getSidebar = () => {
      if (userRoles.includes('superadmin')) {
         return <SuperAdminSidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />;
      } else if (userRoles.some(role => PersonnelRoles.includes(role))) {
         return <PersonnelSidebar isOpen={sidebarToggle} onToggle={toggleSidebar} />;
      } else {
         return <UserSidebar isOpen={sidebarToggle} onToggle={toggleSidebar} />;
      }
   };

   return (
      <ApolloProvider client={client}>
         <NotificationProvider>
            <ChiefRPSNotificationProvider>
               <div className="flex">
                  {isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && (
                     <>
                        {getSidebar()}
                        {showNavbar && <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={toggleSidebar} />}
                     </>
                  )}
                  <div className={`flex-1 transition-all duration-300 ${sidebarToggle && showNavbar ? 'ml-64' : 'ml-0'}`}>
                     <div className="p-0">
                        <Routes>
                           <Route path="/" element={<LandingPage />} />
                           <Route path="/auth" element={<UserAuthPage />} />
                           <Route path="/home" element={<ProtectedRoute roles={['user']}><HomePage /></ProtectedRoute>} />
                           <Route path="/permits" element={<ProtectedRoute roles={['user']}><PermitsPage /></ProtectedRoute>} />
                           <Route path="/applicationsStatus" element={<ProtectedRoute roles={['user']}><UserApplicationsPage /></ProtectedRoute>} />
                           <Route path="/apply/:formType" element={<ProtectedRoute roles={['user']}><ApplicationForm /></ProtectedRoute>} />
                           {/* <Route path="/unauthorized" element={<div className="flex items-center justify-center min-h-screen text-center">Unauthorized Access</div>} /> */}

                           <Route path="/about" element={<AboutPage />} />
                           <Route path="/services" element={<ServicesPage />} />
                           <Route path="/contact" element={<ContactPage />} />
                           <Route path="/learnMore" element={<LearnMorePage />} />
                           <Route path="/profile" element={<UserProfilePage />} />
                           <Route path="/notifications" element={<ProtectedRoute roles={['user']}><UserNotificationsPage /></ProtectedRoute>} />

                           <Route path="/personnel/home" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelHomePage /></ProtectedRoute>} />
                           <Route path="/personnel/review/:id" element={<ProtectedRoute roles={['Chief_RPS']}><ChiefRPSApplicationReviewModal /></ProtectedRoute>} />
                           <Route path="/personnel/view/:id" element={<ProtectedRoute roles={['Chief_RPS']}><ChiefRPSApplicationViewModal /></ProtectedRoute>} />
                           <Route path="/personnel/settings" element={<ProtectedRoute roles={['Chief_RPS']}><PersonnelSettingsPage /></ProtectedRoute>} />
                           <Route path="/personnel/reports" element={<ProtectedRoute roles={['Chief_RPS']}><ChiefRPSReportsPage /></ProtectedRoute>} />
                           <Route path="/personnel/notifications" element={<ProtectedRoute roles={['Chief_RPS']}><ChiefRPSNotificationPage /></ProtectedRoute>} />
                           <Route path="/chief-rps/order-of-payment" element={<ProtectedRoute roles={['Chief_RPS']}><ChiefRPSorderOfPaymentPage /></ProtectedRoute>} />
                           <Route path="/chief-rps/order-of-payment/:action" element={<ProtectedRoute roles={['Chief_RPS']}><ChiefRPSorderOfPaymentPage /></ProtectedRoute>} />

                           {/* Dashboard Routes for Personnels */}
                           <Route path="/personnel/dashboard" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelDashboard /></ProtectedRoute>} />
                           <Route path="/personnel/:role" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelDashboard /></ProtectedRoute>} />

                           <Route path="/superadmin/home" element={<ProtectedRoute roles={['superadmin']}><SuperAdminHomePage /></ProtectedRoute>} />
                           <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
                           <Route path="/superadmin/manage-users" element={<ProtectedRoute roles={['superadmin']}><SuperAdminManageUsersPage /></ProtectedRoute>} />
                           <Route path="/superadmin/reports" element={<ProtectedRoute roles={['superadmin']}><SuperAdminReportsPage /></ProtectedRoute>} />
                           <Route path="/superadmin/settings" element={<ProtectedRoute roles={['superadmin']}><SuperAdminSettingsPage /></ProtectedRoute>} />
                        </Routes>
                     </div>
                  </div>
                  <ToastContainer />
                  <Toaster position="top-right" duration={3000} />
               </div>
            </ChiefRPSNotificationProvider>
         </NotificationProvider>
      </ApolloProvider>
   );
};

export default App;
