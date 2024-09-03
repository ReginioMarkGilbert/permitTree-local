import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaChartLine, FaCog, FaSignInAlt } from 'react-icons/fa';
import permitTreeLogo from '../assets/denr-logo.png';

const AdminSidebar = ({ isOpen }) => {
    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col justify-between fixed top-0 left-0 w-56 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:w-64 z-10`}>
            <div className="mt-6 ml-4">
                <div className="mt-16">
                    <div className="flex items-center justify-center mt-10 mr-5">
                        <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                        <span className="ml-3 text-xl font-semibold">PermitTree</span>
                    </div>
                    <div className="line" style={{ borderBottom: '1px solid #4A5568', marginTop: '20px', width: '190px' }}></div>
                    <nav className="mt-7">
                        <NavLink to="/admin/dashboard" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaTachometerAlt /></span>
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/users" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaUsers /></span>
                            <span>Manage Users</span>
                        </NavLink>
                        <NavLink to="/admin/reports" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaChartLine /></span>
                            <span>Reports</span>
                        </NavLink>
                        <NavLink to="/admin/settings" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                            <span className="mr-3"><FaCog /></span>
                            <span>Settings</span>
                        </NavLink>
                    </nav>
                </div>
            </div>
            <div className="line ml-4" style={{ borderBottom: '1px solid #4A5568', marginTop: '22.5em', width: '190px' }}></div>
            <div className="mb-10 ml-4">
                <NavLink to="/auth" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaSignInAlt /></span>
                    <span>Logout</span>
                </NavLink>
            </div>
        </div>
    );
};

export default AdminSidebar;
