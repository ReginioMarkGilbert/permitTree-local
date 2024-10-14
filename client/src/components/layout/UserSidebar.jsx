import React, { useCallback, useMemo } from 'react';
import { FaBell, FaClipboardList, FaFileAlt, FaHome, FaSignInAlt, FaUser } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import permitTreeLogo from '../../assets/denr-logo.png';
import { useNotification } from '../../pages/user/contexts/UserNotificationContext';
import { isAuthenticated } from '../../utils/auth';
import { removeToken } from '../../utils/tokenManager';
import { gql, useMutation } from '@apollo/client';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const Sidebar = React.memo(({ isOpen }) => {
    const navigate = useNavigate();
    const { unreadCount } = useNotification();
    const [logout] = useMutation(LOGOUT_MUTATION);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            removeToken();
            localStorage.removeItem('user');
            navigate('/auth');
            console.log('Logout successful!');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [logout, navigate]);

    React.useEffect(() => {
        const authStatus = isAuthenticated();
        if (!authStatus) {
            navigate('/auth');
        }
    }, [navigate]);

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
                        <NavLink to="/home" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaHome /></span>
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/permits" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaFileAlt /></span>
                            <span>Apply</span>
                        </NavLink>
                        <NavLink to="/applicationsStatus" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaClipboardList /></span>
                            <span>Application Status</span>
                        </NavLink>
                        <NavLink to="/notifications" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2 relative">
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
                    </nav>
                </div>
            </div>
            <div className="line ml-4" style={{ borderBottom: '1px solid #ffffff', marginTop: '22.5em', width: '190px' }}></div>
            <div className="mb-10 ml-4">
                <h2 className="px-4 text-sm text-white uppercase">Account Pages</h2>
                <NavLink to="/profile" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaUser /></span>
                    <span>Profile</span>
                </NavLink>
                <NavLink to="#" onClick={handleLogout} className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaSignInAlt /></span>
                    <span>Logout</span>
                </NavLink>
            </div>
        </>
    ), [unreadCount, handleLogout]);

    if (!isAuthenticated()) {
        return null;
    }

    return (
        <div
            className={`h-full bg-green-800 text-white flex flex-col justify-between fixed top-0 left-0 w-56 md:w-64 z-10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ willChange: 'transform' }}
        >
            {sidebarContent}
        </div>
    );
});

export default Sidebar;
