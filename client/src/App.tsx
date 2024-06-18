import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import PermitsPage from './pages/permitsPage';
import UserAuthPage from './pages/UserAuthPage';
import UserProfilePage from './pages/UserProfilePage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSidebarToggle } from './hooks/useSidebarToggle';

const App = () => {
    const { sidebarToggle, toggleSidebar } = useSidebarToggle();

    return (
        <div className="flex">
            <Sidebar isOpen={sidebarToggle} toggleSidebar={toggleSidebar} />
            <div className={`flex-1 transition-all duration-300 ${sidebarToggle ? 'ml-64' : 'ml-0'}`}>
                <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={toggleSidebar} />
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/auth" />} />
                        <Route path="/auth" element={<UserAuthPage />} /> {/* Combined login and signup page */}
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/permits" element={<PermitsPage />} />
                        <Route path="/profile" element={<UserProfilePage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;