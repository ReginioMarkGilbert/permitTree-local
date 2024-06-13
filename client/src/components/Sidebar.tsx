import React from 'react';
import { FaHome, FaFileAlt, FaBell, FaUser, FaSignInAlt, FaClipboardList } from 'react-icons/fa';
import permitTreeLogo from '../assets/denr-logo.png';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col justify-between fixed top-0 left-0 w-56 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mt-6 ml-4">
                <div className="mt-16">
                    <div className="flex items-center justify-center mt-10 mr-5">
                        <img src={permitTreeLogo} alt="PermitTree Logo" className="h-12" />
                        <span className="ml-3 text-xl font-semibold">PermitTree</span>
                    </div>
                    <div className="line" style={{ borderBottom: '1px solid #4A5568', marginTop: '20px', width: '190px' }}></div>
                    <nav className="mt-7">
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
            </div>
            <div className="line ml-4" style={{ borderBottom: '1px solid #4A5568', marginTop: '22.5em', width: '190px' }}></div>
            <div className="mb-10 ml-4">
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
