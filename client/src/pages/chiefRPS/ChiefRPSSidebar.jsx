import React from 'react';
import { FaTachometerAlt, FaUsers, FaChartLine, FaCog, FaSignInAlt, FaHome, FaClipboardCheck, FaBell, FaFileInvoiceDollar } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import permitTreeLogo from '../../assets/denr-logo.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated } from '../../utils/auth';
import { removeToken } from '../../utils/tokenManager'; // Import removeToken from tokenManager instead
import { useChiefRPSNotification } from './contexts/ChiefRPSNotificationContext';

const AdminSidebar = ({ isOpen }) => {
    const navigate = useNavigate();
    const { unreadCount } = useChiefRPSNotification();

    const handleLogout = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3000/api/logout'
                : window.location.hostname === '192.168.1.12'
                    ? 'http://192.168.1.12:3000/api/logout' // for other laptop
                    : window.location.hostname === '192.168.1.15'
                        ? 'http://192.168.1.15:3000/api/logout' // for new url
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
        // console.log('Authentication status:', authStatus);
        if (!authStatus) {
            navigate('/auth');
        }
    }, [navigate]);

    if (!isAuthenticated()) {
        console.log('Rendering null due to failed authentication');
        return null;
    }

    return (
        <div className={`h-full bg-green-800 text-white flex flex-col justify-between fixed top-0 left-0 w-56 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:w-64 z-10`}>
            <div className="mt-6 ml-4">
                <div className="mt-16">
                    <div className="flex items-center justify-center mt-10 mr-5">
                        <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                        <span className="ml-3 text-xl font-semibold">PermitTree</span>
                    </div>
                    <div className="line" style={{ borderBottom: '1px solid #ffffff', marginTop: '20px', width: '190px' }}></div>
                    <nav className="mt-7">
                        <NavLink to="/chief-rps/home" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaHome /></span>
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/chief-rps/dashboard" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaTachometerAlt /></span>
                            <span>Dashboard</span>
                        </NavLink>
                        {/* <NavLink to="/chief-rps/review" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaClipboardCheck /></span>
                            <span>Review Applications</span>
                        </NavLink> */}
                        <NavLink to="/chief-rps/notifications" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2 relative">
                            <div className="relative mr-3">
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -left-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                        {unreadCount}
                                    </span>
                                )}
                                <FaBell className="text-xl" />
                            </div>
                            <span>Notifications</span>
                        </NavLink>
                        <NavLink to="/chief-rps/reports" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaChartLine /></span>
                            <span>Reports</span>
                        </NavLink>
                        <NavLink to="/chief-rps/settings" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaCog /></span>
                            <span>Settings</span>
                        </NavLink>
                        <NavLink to="/chief-rps/order-of-payment" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaFileInvoiceDollar /></span>
                            <span>Order of Payment</span>
                        </NavLink>
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
        </div>
    );
};

export default AdminSidebar;
