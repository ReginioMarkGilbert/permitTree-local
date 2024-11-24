import React from 'react';
import { FaBars, FaTimes, FaLeaf } from 'react-icons/fa';

const Navbar = ({ sidebarToggle, setSidebarToggle }) => {
    const handleToggle = () => {
        setSidebarToggle(!sidebarToggle);
    };

    return (
        <nav className="fixed top-0 left-2 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-[2520px] mx-auto flex justify-between items-center px-4 h-16">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggle}
                        className="text-gray-600 hover:text-green-700 p-2 rounded-lg
                            hover:bg-gray-100 transition-colors duration-200 -ml-2"
                        aria-label="Toggle Sidebar"
                    >
                        <div className="relative w-5 h-5">
                            <FaBars
                                size={20}
                                className={`absolute transition-all duration-200
                                    ${sidebarToggle ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                            />
                            <FaTimes
                                size={20}
                                className={`absolute transition-all duration-200
                                    ${sidebarToggle ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                            />
                        </div>
                    </button>
                    <div className="flex items-center gap-2 group">
                        <FaLeaf className="h-5 w-5 text-green-600 group-hover:text-green-700 transition-colors" />
                        <span className="text-xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                            PermitTree
                        </span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-600">
                        DENR Region 4B
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
