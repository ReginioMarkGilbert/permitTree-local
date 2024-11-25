import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/layout/Navbar';
import UserSidebar from './components/layout/UserSidebar';
import useSidebarToggle from './hooks/useSidebarToggle';
import UserHomePage from './pages/user/UserHomePage';
import UserProfilePage from './pages/user/UserProfilePage';
import PermitsPage from './pages/user/permitsPage';
import UserApplicationsPage from './pages/user/UserApplicationsStatusPage';
import ApplicationForm from './pages/user/ApplicationForm';
import UserAuthPage from './pages/public/UserAuthPage';
import UserNotificationsPage from './pages/user/UserNotificationsPage';

import LandingPage from './pages/public/LandingPage';
import LearnMorePage from './pages/public/LearnMorePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';

import PersonnelSidebar from './pages/Personnel/components/PersonnelSidebar';
import PersonnelHomePage from './pages/Personnel/PersonnelHomePage';
import PersonnelNotificationPage from './pages/Personnel/PersonnelNotificationPage';
import PersonnelReportsPage from './pages/Personnel/PersonnelReportsPage';
import PersonnelSettingsPage from './pages/Personnel/PersonnelSettingsPage';

import { isAuthenticated, getUserRoles } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SuperAdminSidebar from './pages/SuperAdmin/SuperAdminSidebar';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import SuperAdminHomePage from './pages/SuperAdmin/SuperAdminHomePage';
import SuperAdminManageUsersPage from './pages/SuperAdmin/SuperAdminManageUsersPage';
import SuperAdminReportsPage from './pages/SuperAdmin/SuperAdminReportsPage';
import SuperAdminSettingsPage from './pages/SuperAdmin/SuperAdminSettingsPage';

import { checkTokenExpiration } from './utils/tokenManager';
import OOPFormCreationPage from './pages/Personnel/OOPFormCreationPage';

import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

import { Toaster } from 'sonner';

import PersonnelDashboard from './pages/Personnel/PersonnelDashboard';

// import { AuthProvider } from '@/context/AuthContext';

import OOPPrintPage from './pages/user/OOPPrintPage';
import PaymentPage from './pages/user/PaymentPage';
import ORPrintPage from './pages/user/ORPrintPage';
import GISDashboardPage from './pages/Personnel/GISDashboardPage';
import InspectionSchedulingPage from './pages/Personnel/InspectionSchedulingPage';

import { cn } from './lib/utils';

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
      setShowNavbar(authStatus && location.pathname !== '/' && location.pathname !== '/user/oop-print');
   }, [navigate, location.pathname]);

   useEffect(() => {
      const intervalId = setInterval(() => {
         checkTokenExpiration(navigate);
      }, 60000); // Check every minute

      return () => clearInterval(intervalId);
   }, [navigate]);

   const PersonnelRoles = [
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
   ];

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
         <div className="relative h-screen overflow-hidden">
            {isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/user/oop-print' && location.pathname !== '/user/or-print' && (
               <div className="flex h-full">
                  {getSidebar()}
                  <div className={cn(
                     "flex-1 min-w-0 flex flex-col",
                     // sidebarToggle ? 'lg:pl-[270px]' : 'lg:pl-[50px]',
                     'transition-[padding] duration-300'
                  )}>
                     {showNavbar && <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={toggleSidebar} />}
                     <main className={cn(
                        "flex-1 overflow-y-auto bg-background transition-colors duration-300",
                        sidebarToggle ? 'lg:pl-[260px]' : 'lg:pl-[60px]',
                        'transition-[padding] duration-300'
                     )}>
                        <Routes>
                           <Route path="/" element={<LandingPage />} />
                           <Route path="/auth" element={<UserAuthPage />} />
                           <Route path="/home" element={<ProtectedRoute roles={['user']}><UserHomePage /></ProtectedRoute>} />
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
                           <Route path="/personnel/settings" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelSettingsPage /></ProtectedRoute>} />
                           <Route path="/personnel/reports" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelReportsPage /></ProtectedRoute>} />
                           <Route path="/personnel/notifications" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelNotificationPage /></ProtectedRoute>} />
                           <Route path="/personnel/order-of-payment" element={<ProtectedRoute roles={['Chief_RPS', 'Accountant', 'PENR_CENR_Officer']}><OOPFormCreationPage /></ProtectedRoute>} />
                           <Route path="/personnel/order-of-payment/:action" element={<ProtectedRoute roles={['Chief_RPS', 'Accountant', 'PENR_CENR_Officer']}><OOPFormCreationPage /></ProtectedRoute>} />

                           {/* Dashboard Routes for Personnels */}
                           <Route path="/personnel/dashboard" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelDashboard /></ProtectedRoute>} />
                           <Route path="/personnel/:role" element={<ProtectedRoute roles={PersonnelRoles}><PersonnelDashboard /></ProtectedRoute>} />

                           <Route // oop creation page only accessible to Chief_RPS, PENR_CENR_Officer, and Accountant
                              path="/personnel/create-oop"
                              element={
                                 <ProtectedRoute roles={['Chief_RPS', 'PENR_CENR_Officer', 'Accountant']}>
                                    <OOPFormCreationPage />
                                 </ProtectedRoute>
                              }
                           />

                           <Route path="/superadmin/home" element={<ProtectedRoute roles={['superadmin']}><SuperAdminHomePage /></ProtectedRoute>} />
                           <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
                           <Route path="/superadmin/manage-users" element={<ProtectedRoute roles={['superadmin']}><SuperAdminManageUsersPage /></ProtectedRoute>} />
                           <Route path="/superadmin/reports" element={<ProtectedRoute roles={['superadmin']}><SuperAdminReportsPage /></ProtectedRoute>} />
                           <Route path="/superadmin/settings" element={<ProtectedRoute roles={['superadmin']}><SuperAdminSettingsPage /></ProtectedRoute>} />
                           <Route path="/user/oop-print" element={<OOPPrintPage />} />
                           <Route path="/user/or-print" element={<ORPrintPage />} />
                           <Route
                              path="/payment/:oopId"
                              element={
                                 <ProtectedRoute roles={['user']}>
                                    <PaymentPage />
                                 </ProtectedRoute>
                              }
                           />
                           <Route
                              path="/gis"
                              element={
                                 <ProtectedRoute roles={PersonnelRoles}>
                                    <GISDashboardPage />
                                 </ProtectedRoute>
                              }
                           />
                           <Route
                              path="/personnel/inspection-scheduling"
                              element={
                                 <ProtectedRoute roles={['Technical_Staff']}>
                                    <InspectionSchedulingPage />
                                 </ProtectedRoute>
                              }
                           />
                        </Routes>
                     </main>
                  </div>
               </div>
            )}
            {/* For non-authenticated routes */}
            {(!isAuthenticated() || location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/user/oop-print' || location.pathname === '/user/or-print') && (
               <main className="h-full overflow-y-auto bg-background">
                  <Routes>
                     <Route path="/" element={<LandingPage />} />
                     <Route path="/auth" element={<UserAuthPage />} />
                     <Route path="/user/oop-print" element={<OOPPrintPage />} />
                     <Route path="/user/or-print" element={<ORPrintPage />} />
                  </Routes>
               </main>
            )}
            <ToastContainer />
            <Toaster position="top-right" duration={3000} />
         </div>
      </ApolloProvider>
   );
};

export default App;
