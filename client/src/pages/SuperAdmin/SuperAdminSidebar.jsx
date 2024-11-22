import React, { useCallback, useMemo } from 'react';
import { FaChartLine, FaCog, FaHome, FaSignInAlt, FaTachometerAlt, FaUsers } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import permitTreeLogo from '@/assets/denr-logo.png';
import axios from 'axios';
import { removeToken } from '@/utils/tokenManager';

const SuperAdminSidebar = React.memo(({ isOpen }) => {
    const navigate = useNavigate();

    const handleLogout = useCallback(async () => {
        try {
            await axios.get('http://localhost:3000/api/logout');
            removeToken();
            navigate('/auth');
            console.log('Logout successful!');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [navigate]);

    const sidebarLinks = useMemo(() => [
        { to: "/superadmin/home", icon: <FaHome />, text: "Home" },
        { to: "/superadmin/dashboard", icon: <FaTachometerAlt />, text: "Dashboard" },
        { to: "/superadmin/manage-users", icon: <FaUsers />, text: "Manage Users" },
        { to: "/superadmin/reports", icon: <FaChartLine />, text: "Reports" },
        { to: "/superadmin/application-maintenance", icon: <FaCog />, text: "Application Maintenance" },
    ], []);

    const sidebarContent = useMemo(() => (
        <>
            <div className="mt-6 ml-4">
                <div className="mt-16">
                    <div className="flex items-center justify-start mt-10 mr-5 pl-2">
                        <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                        <span className="pl-2 text-xl font-semibold">PermitTree</span>
                    </div>
                    <div className="line" style={{ borderBottom: '1px solid #ffffff', marginTop: '20px', width: '190px' }}></div>
                    <nav className="mt-7">
                        {sidebarLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                                <span className="mr-3">{link.icon}</span>
                                <span>{link.text}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="line ml-4" style={{ borderBottom: '1px solid #ffffff', marginTop: '22.5em', width: '190px' }}></div>
            <div className="mb-10 ml-4">
                <NavLink to="#" onClick={handleLogout} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaSignInAlt /></span>
                    <span>Logout</span>
                </NavLink>
            </div>
        </>
    ), [sidebarLinks, handleLogout]);

    return (
        <div
            className={`h-full bg-green-800 text-white flex flex-col justify-between fixed top-0 left-0 w-56 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:w-64 z-10`}
            style={{ willChange: 'transform' }}
        >
            {sidebarContent}
        </div>
    );
});

export default SuperAdminSidebar;
