import React from 'react';
import { FaHome, FaFileAlt, FaBell, FaUser, FaSignInAlt, FaClipboardList } from 'react-icons/fa';
import permitTreeLogo from '../assets/denr-logo.png';

const Sidebar: React.FC = () => {
    return (
        <div className="h-full bg-gray-900 text-white flex flex-col justify-between fixed top-0 left-0 w-64">
            <div>
                <div className="flex items-center justify-center mt-10">
                    <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                    <span className="ml-3 text-xl font-semibold">PermitTree</span>
                </div>
                <nav className="mt-10">
                    <a href="#" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                        <span className="mr-3"><FaHome /></span>
                        <span>Home</span>
                    </a>
                    <a href="#" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                        <span className="mr-3"><FaFileAlt /></span>
                        <span>Apply</span>
                    </a>
                    <a href="#" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                        <span className="mr-3"><FaClipboardList /></span>
                        <span>Application Status</span>
                    </a>
                    <a href="#" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                        <span className="mr-3"><FaBell /></span>
                        <span>Notifications</span>
                    </a>
                </nav>
            </div>
            <div className="mb-10">
                <h2 className="px-4 text-xs text-gray-500 uppercase">Account Pages</h2>
                <a href="#" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaUser /></span>
                    <span>Profile</span>
                </a>
                <a href="#" className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md mt-2">
                    <span className="mr-3"><FaSignInAlt /></span>
                    <span>Logout</span>
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
