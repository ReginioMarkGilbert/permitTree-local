import React, { useCallback, useMemo } from 'react';
import { FaTachometerAlt, FaUsers, FaChartLine, FaCog, FaSignInAlt, FaHome, FaClipboardCheck, FaBell, FaFileInvoiceDollar } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import permitTreeLogo from '../../assets/denr-logo.png';
import axios from 'axios';
import { isAuthenticated } from '../../utils/auth';
import { removeToken } from '../../utils/tokenManager';
import { useChiefRPSNotification } from './contexts/ChiefRPSNotificationContext';

const AdminSidebar = React.memo(({ isOpen }) => {
    const navigate = useNavigate();
    const { unreadCount } = useChiefRPSNotification();

    const handleLogout = useCallback(async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3000/api/logout'
                : window.location.hostname === '192.168.1.12'
                    ? 'http://192.168.1.12:3000/api/logout'
                    : window.location.hostname === '192.168.1.15'
                        ? 'http://192.168.1.15:3000/api/logout'
                        : 'http://192.168.137.1:3000/api/logout';
            await axios.get(apiUrl);
            removeToken();
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [navigate]);

    const sidebarLinks = useMemo(() => [
        { to: "/chief-rps/home", icon: <FaHome />, text: "Home" },
        { to: "/chief-rps/dashboard", icon: <FaTachometerAlt />, text: "Dashboard" },
        { to: "/chief-rps/notifications", icon: <FaBell />, text: "Notifications", count: unreadCount },
        { to: "/chief-rps/reports", icon: <FaChartLine />, text: "Reports" },
        { to: "/chief-rps/settings", icon: <FaCog />, text: "Settings" },
        { to: "/chief-rps/order-of-payment", icon: <FaFileInvoiceDollar />, text: "Order of Payment" },
    ], [unreadCount]);

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
                            <NavLink key={link.to} to={link.to} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2 relative">
                                <span className="mr-3 relative">
                                    {link.icon}
                                    {link.count > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                            {link.count}
                                        </span>
                                    )}
                                </span>
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

export default AdminSidebar;
