import React from 'react';
import { FaBars } from 'react-icons/fa';

interface NavbarProps {
    sidebarToggle: boolean;
    setSidebarToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarToggle, setSidebarToggle }) => {
    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10 flex items-center">
            <button className="ml-2" onClick={() => setSidebarToggle(!sidebarToggle)}>
                <FaBars />
            </button>
            <h1 className="text-lg font-semibold ml-4">DENR PENRO Permit Issuance</h1>
        </nav>
    );
}

export default Navbar;
