import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import PermitsPage from './pages/permitsPage';
import UserAuthPage from './pages/UserAuthPage';
import UserProfilePage from './pages/UserProfilePage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSidebarToggle } from './hooks/useSidebarToggle';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    const { sidebarToggle, toggleSidebar } = useSidebarToggle();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/auth');
        }
    }, [navigate]);

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
                        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;
