import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ sidebarToggle, setSidebarToggle }) => {
    const handleToggle = () => {
        setSidebarToggle(!sidebarToggle);
    };

    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10 flex items-center" style={{ background: 'linear-gradient(90deg, #4a6b4a, #334b17)', zIndex: 1000 }}>
            <div className="ml-2 p-2 cursor-pointer" onClick={handleToggle} role="button" tabIndex={0} onKeyPress={handleToggle}>
                {sidebarToggle ? <FaTimes size={20} /> : <FaBars size={20} />}
            </div>
            <h1 className="text-lg font-semibold ml-4">DENR PENRO Permit Issuance</h1>
        </nav>
    );
};

export default Navbar;
