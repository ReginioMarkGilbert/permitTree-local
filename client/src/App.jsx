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

import ChiefRPSSidebar from './pages/chiefRPS/ChiefRPSSidebar';
import ChiefRPSHomePage from './pages/chiefRPS/ChiefRPSHomePage';
import ChiefRPSDashboard from './pages/chiefRPS/ChiefRPSDashboard';
import ChiefRPSReportsPage from './pages/chiefRPS/ChiefRPSReportsPage';
import ChiefRPSSettingsPage from './pages/chiefRPS/ChiefRPSSettingsPage';
import ChiefRPSApplicationReviewModal from './pages/chiefRPS/components/ChiefRPSApplicationReviewModal';
import ChiefRPSApplicationViewModal from './pages/chiefRPS/components/ChiefRPSApplicationViewModal';

import { isAuthenticated, getUserRole, logout } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SuperAdminSidebar from './pages/SuperAdmin/SuperAdminSidebar';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import SuperAdminHomePage from './pages/SuperAdmin/SuperAdminHomePage';
import SuperAdminManageUsersPage from './pages/SuperAdmin/SuperAdminManageUsersPage';
import SuperAdminReportsPage from './pages/SuperAdmin/SuperAdminReportsPage';
import SuperAdminSettingsPage from './pages/SuperAdmin/SuperAdminSettingsPage';
import ChiefRPSNotificationPage from './pages/chiefRPS/ChiefRPSNotificationPage';
import ChiefRPSNotificationProvider from './pages/chiefRPS/contexts/ChiefRPSNotificationContext';

import { checkTokenExpiration } from './utils/tokenManager';
import ChiefRPSorderOfPaymentPage from './pages/chiefRPS/ChiefRPSorderOfPaymentPage';

const App = () => {
  const { sidebarToggle, toggleSidebar } = useSidebarToggle();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/about' && location.pathname !== '/services' && location.pathname !== '/contact' && location.pathname !== '/learnMore') {
      navigate('/auth');
    }
    // Set showNavbar based on authentication and current path
    setShowNavbar(isAuthenticated() && location.pathname !== '/');
  }, [navigate, location.pathname]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkTokenExpiration(navigate);
      // console.log('checking token expiration');
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <NotificationProvider>
      <ChiefRPSNotificationProvider>
        <div className="flex">
          {isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && (
            <>
              {userRole === 'superadmin' ? (
                <SuperAdminSidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
              ) : userRole === 'ChiefRPS' ? (
                <ChiefRPSSidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
              ) : (
                <UserSidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
              )}
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
                <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/learnMore" element={<LearnMorePage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/notifications" element={<ProtectedRoute roles={['user']}><UserNotificationsPage /></ProtectedRoute>} />

                <Route path="/chief-rps/home" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSHomePage /></ProtectedRoute>} />
                <Route path="/chief-rps/dashboard" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSDashboard /></ProtectedRoute>} />
                <Route path="/chief-rps/review/:id" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSApplicationReviewModal /></ProtectedRoute>} />
                <Route path="/chief-rps/view/:id" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSApplicationViewModal /></ProtectedRoute>} />
                <Route path="/chief-rps/settings" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSSettingsPage /></ProtectedRoute>} />
                <Route path="/chief-rps/reports" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSReportsPage /></ProtectedRoute>} />
                <Route path="/chief-rps/notifications" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSNotificationPage /></ProtectedRoute>} />
                <Route path="/chief-rps/order-of-payment" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSorderOfPaymentPage /></ProtectedRoute>} />
                <Route path="/chief-rps/order-of-payment/:action" element={<ProtectedRoute roles={['ChiefRPS']}><ChiefRPSorderOfPaymentPage /></ProtectedRoute>} />

                <Route path="/superadmin/home" element={<ProtectedRoute roles={['superadmin']}><SuperAdminHomePage /></ProtectedRoute>} />
                <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
                <Route path="/superadmin/manage-users" element={<ProtectedRoute roles={['superadmin']}><SuperAdminManageUsersPage /></ProtectedRoute>} />
                <Route path="/superadmin/reports" element={<ProtectedRoute roles={['superadmin']}><SuperAdminReportsPage /></ProtectedRoute>} />
                <Route path="/superadmin/settings" element={<ProtectedRoute roles={['superadmin']}><SuperAdminSettingsPage /></ProtectedRoute>} />

              </Routes>
            </div>
          </div>
          <ToastContainer />
        </div>
      </ChiefRPSNotificationProvider>
    </NotificationProvider>
  );
};

export default App;
