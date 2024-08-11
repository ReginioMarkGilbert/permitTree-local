import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import PermitsPage from './pages/permitsPage';

import StoreSelectionPage from './pages/StoreSelectionPage';
import ApplicationForm from './pages/ApplicationForm';
import MessageBox from './pages/MessageBox';
import StatusPage from './pages/StatusPage';

import HomePage from './pages/HomePage';

import UserAuthPage from './pages/UserAuthPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminPage from './pages/AdminPage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSidebarToggle } from './hooks/useSidebarToggle';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    const { sidebarToggle, toggleSidebar } = useSidebarToggle();
    const navigate = useNavigate();
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/auth');
        }
    }, [navigate]);

    const handleStoreSelection = (store) => {
        setSelectedStore(store);
        navigate(`/apply/${store}`);
    };

    const handleSubmitApplication = async (formData) => {
        try {
            const response = await fetch('http://localhost:5000/api/createApplication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Application submitted:', data);
                navigate('/message'); // Navigate to the MessageBox component
            } else {
                console.error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleViewStatus = () => {
        navigate('/status');
    };

    return (
        <div className="flex">
            {isAuthenticated() && (
                <>
                    <Sidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
                    <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={toggleSidebar} />
                </>
            )}
            <div className={`flex-1 transition-all duration-300 ${sidebarToggle ? 'ml-64' : 'ml-0'}`}>
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/auth" />} />
                        <Route path="/auth" element={<UserAuthPage />} />
                        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                        <Route path="/permits" element={<ProtectedRoute><PermitsPage /></ProtectedRoute>} />

                        <Route path="/apply" element={<ProtectedRoute><StoreSelectionPage onContinue={handleStoreSelection} /></ProtectedRoute>} />
                        <Route path="/apply/:store" element={<ProtectedRoute><ApplicationForm onSubmit={handleSubmitApplication} selectedStore={selectedStore} /></ProtectedRoute>} />
                        <Route path="/message" element={<ProtectedRoute><MessageBox onViewStatus={handleViewStatus} /></ProtectedRoute>} />
                        <Route path="/status" element={<ProtectedRoute><StatusPage /></ProtectedRoute>} />

                        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

                        {/* admin routes */}
                        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;
