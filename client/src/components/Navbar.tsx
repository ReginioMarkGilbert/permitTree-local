import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../App.css';

interface NavbarProps {
    sidebarToggle: boolean;
    setSidebarToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarToggle, setSidebarToggle }) => {
    const handleToggle = () => {
        setSidebarToggle(!sidebarToggle);
    };

    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10 flex items-center">
            <button className="ml-2 p-2" onClick={handleToggle}>
                {sidebarToggle ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h1 className="text-lg font-semibold ml-4">DENR PENRO Permit Issuance</h1>
        </nav>
    );
}

export default Navbar;
