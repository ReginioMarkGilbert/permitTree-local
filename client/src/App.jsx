import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import UserSidebar from './components/layout/UserSidebar';
import AdminSidebar from './components/layout/AdminSidebar';
import HomePage from './pages/user/HomePage';
import AdminPage from './pages/admin/AdminPage';
import PermitsPage from './pages/user/PermitsPage';
import StoreSelectionPage from './pages/user/StoreSelectionPage';
import ApplicationForm from './pages/user/ApplicationForm';
import MessageBox from './pages/user/MessageBox';
import StatusPage from './pages/user/StatusPage';
import UserAuthPage from './pages/UserAuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, getUserRole } from './utils/auth';
import useSidebarToggle from './hooks/useSidebarToggle';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage'; // Import the AboutPage
import ServicesPage from './pages/ServicesPage'; // Import the ServicesPage
import ContactPage from './pages/ContactPage'; // Import the ContactPage

const App = () => {
    const { sidebarToggle, toggleSidebar } = useSidebarToggle();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedStore, setSelectedStore] = useState(null);
    const userRole = getUserRole();

    useEffect(() => {
        if (!isAuthenticated() && location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/about' && location.pathname !== '/services' && location.pathname !== '/contact') {
            navigate('/auth');
        }
    }, [navigate, location.pathname]);

    const handleStoreSelection = (store) => {
        setSelectedStore(store);
        navigate(`/apply/${store}`);
    };

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
                        {/* <Route path="/apply" element={<ProtectedRoute roles={['user']}><StoreSelectionPage onContinue={handleStoreSelection} /></ProtectedRoute>} /> */}
                        <Route path="/apply/:formType" element={<ProtectedRoute roles={['user']}><ApplicationForm /></ProtectedRoute>} />
                        <Route path="/message" element={<ProtectedRoute roles={['user']}><MessageBox /></ProtectedRoute>} />
                        <Route path="/status" element={<ProtectedRoute roles={['user']}><StatusPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
                        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/contact" element={<ContactPage />} /> Add the route for ContactPage
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;
