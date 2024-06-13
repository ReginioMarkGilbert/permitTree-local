import React from 'react';
// import { FaBars } from 'react-icons/fa';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 left-64 right-0 z-10 flex items-center">
            <h1 className="text-lg font-semibold">DENR PENRO Permit Issuance</h1>
        </nav>
    );
}

export default Navbar;
