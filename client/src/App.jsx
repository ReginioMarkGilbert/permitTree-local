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
import UserAuthPage from './pages/UserAuthPage';

import LandingPage from './pages/LandingPage';
import LearnMorePage from './pages/LearnMorePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';

import AdminSidebar from './pages/admin/AdminSidebar';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplicationReviewPage from './pages/admin/AdminApplicationReviewPage';
import AdminApplicationViewModal from './pages/admin/components/AdminApplicationViewModal';

import { isAuthenticated, getUserRole, isTokenExpired, logout, getToken } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    const { sidebarToggle, toggleSidebar } = useSidebarToggle();
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = getUserRole();

    useEffect(() => {
        if (!isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/about' && location.pathname !== '/services' && location.pathname !== '/contact' && location.pathname !== '/learnMore') {
            navigate('/auth');
        }
    }, [navigate, location.pathname]);

    return (
        <div className="flex">
            {isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && (
                <>
                    {userRole === 'admin' ? (
                        <AdminSidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
                    ) : (
                        <UserSidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
                    )}
                    <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={toggleSidebar} />
                </>
            )}
            <div className={`flex-1 transition-all duration-300 ${sidebarToggle ? 'ml-64' : 'ml-0'}`}>
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

                        <Route path="/admin/home" element={<ProtectedRoute roles={['admin']}><AdminHomePage /></ProtectedRoute>} />
                        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/review/:id" element={<ProtectedRoute roles={['admin']}><AdminApplicationReviewPage /></ProtectedRoute>} />
                        <Route path="/admin/view/:id" element={<ProtectedRoute roles={['admin']}><AdminApplicationViewModal /></ProtectedRoute>} />
                    </Routes>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default App;
