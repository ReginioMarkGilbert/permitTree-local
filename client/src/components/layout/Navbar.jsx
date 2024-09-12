import React from 'react';
import { FaBars, FaTimes, FaLeaf } from 'react-icons/fa';

const Navbar = ({ sidebarToggle, setSidebarToggle }) => {
    const handleToggle = () => {
        setSidebarToggle(!sidebarToggle);
    };

    return (
        <nav className="bg-white text-green-800 shadow-md z-10 fixed top-0 left-0 right-0 flex justify-between items-center p-4">
            <div className="flex items-center space-x-2">
                <div
                    onClick={handleToggle}
                    className="text-green-800 py-2 px-4 rounded cursor-pointer"
                >
                    {sidebarToggle ? <FaTimes size={20} /> : <FaBars size={20} />}
                </div>
                <FaLeaf className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-green-800">PermitTree</span>
            </div>
        </nav>
    );
};

export default Navbar;
