import React, { useEffect, useState } from 'react'; // Added useState import
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserSidebar from './components/UserSidebar';
import AdminSidebar from './components/AdminSidebar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

import PermitsPage from './pages/permitsPage';

import StoreSelectionPage from './pages/StoreSelectionPage';
import ApplicationForm from './pages/ApplicationForm';
import MessageBox from './pages/MessageBox';
import StatusPage from './pages/StatusPage';

import UserAuthPage from './pages/UserAuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, getUserRole } from './utils/auth';
import useSidebarToggle from './hooks/useSidebarToggle';
import useApplicationHandlers from './hooks/useApplicationHandlers'; // Import the custom hook

const App = () => {
    const { sidebarToggle, toggleSidebar } = useSidebarToggle();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedStore, setSelectedStore] = useState(null);
    const userRole = getUserRole();
    const { handleSubmitApplication, handleViewStatus } = useApplicationHandlers(); // Use the custom hook

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/auth');
        }
    }, [navigate]);

    const handleStoreSelection = (store) => {
        setSelectedStore(store);
        navigate(`/apply/${store}`);
    };

    return (
        <div className="flex">
            {isAuthenticated() && location.pathname !== '/auth' && (
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
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/auth" />} />
                        <Route path="/auth" element={<UserAuthPage />} />
                        <Route path="/home" element={<ProtectedRoute roles={['user']}><HomePage /></ProtectedRoute>} />
                        <Route path="/permits" element={<ProtectedRoute roles={['user']}><PermitsPage /></ProtectedRoute>} />
                        <Route path="/apply" element={<ProtectedRoute roles={['user']}><StoreSelectionPage onContinue={handleStoreSelection} /></ProtectedRoute>} />
                        <Route path="/apply/:formType" element={<ProtectedRoute roles={['user']}><ApplicationForm /></ProtectedRoute>} />
                        <Route path="/message" element={<ProtectedRoute roles={['user']}><MessageBox /></ProtectedRoute>} />
                        <Route path="/status" element={<ProtectedRoute roles={['user']}><StatusPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
                        {/* Add other routes as needed */}
                        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;
