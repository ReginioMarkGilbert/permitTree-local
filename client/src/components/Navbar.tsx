import React from 'react';
import { FaBars } from 'react-icons/fa';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10 flex items-center">
            <button onClick={toggleSidebar} className="mr-4">
                <FaBars size={24} />
            </button>
            <h1 className="text-lg font-semibold">DENR PENRO Permit Issuance</h1>
        </nav>
    );
}

export default Navbar;
