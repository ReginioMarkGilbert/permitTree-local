import React from 'react';
import { FaHome, FaFileAlt, FaBell, FaUser, FaSignInAlt, FaClipboardList } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import permitTreeLogo from '../assets/denr-logo.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated, removeToken } from '../utils/auth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api/logout'
            : window.location.hostname === '192.168.1.12'
            ? 'http://192.168.1.12:3000/api/logout' // for other laptop
            : 'http://192.168.137.1:3000/api/logout'; // for mobile
            await axios.get(apiUrl);
            removeToken();
            navigate('/auth');
            console.log('Logout successful!');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    React.useEffect(() => {
        const authStatus = isAuthenticated();
        console.log('Authentication status:', authStatus);
        if (!authStatus) {
            navigate('/auth');
        }
    }, []);

    if (!isAuthenticated()) {
        console.log('Rendering null due to failed authentication');
        return null;
    }

    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col justify-between fixed top-0 left-0 w-56 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:w-64`}>
            <div className="mt-6 ml-4">
                <div className="mt-16">
                    <div className="flex items-center justify-center mt-10 mr-5">
                        <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                        <span className="ml-3 text-xl font-semibold">PermitTree</span>
                    </div>
                    <div className="line" style={{ borderBottom: '1px solid #4A5568', marginTop: '20px', width: '190px' }}></div>
                    <nav className="mt-7">
                        <NavLink to="/home" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaHome /></span>
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/permits" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaFileAlt /></span>
                            <span>Apply</span>
                        </NavLink>
                        <NavLink to="/status" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaClipboardList /></span>
                            <span>Application Status</span>
                        </NavLink>
                        <NavLink to="/notifications" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaBell /></span>
                            <span>Notifications</span>
                        </NavLink>
                    </nav>
                </div>
            </div>
            <div className="line ml-4" style={{ borderBottom: '1px solid #4A5568', marginTop: '22.5em', width: '190px' }}></div>
            <div className="mb-10 ml-4">
                <h2 className="px-4 text-xs text-gray-500 uppercase">Account Pages</h2>
                <NavLink to="/profile" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaUser /></span>
                    <span>Profile</span>
                </NavLink>
                <NavLink to="#" onClick={handleLogout} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaSignInAlt /></span>
                    <span>Logout</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
