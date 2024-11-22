import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white shadow-sm w-full">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link className="flex items-center justify-center" to="/">
                        <FaLeaf className="h-6 w-6 text-green-600" />
                        <span className="ml-2 text-xl font-bold text-green-800">PermitTree</span>
                    </Link>
                    <div className="flex items-center md:hidden">
                        <button onClick={toggleMenu} className="text-green-600 focus:outline-none">
                            {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                    <nav className="hidden md:flex items-center space-x-4">
                        <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors" to="/">
                            Home
                        </Link>
                        <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors" to="/about">
                            About
                        </Link>
                        <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors" to="/services">
                            Services
                        </Link>
                        <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors" to="/contact">
                            Contact
                        </Link>
                        <Link to="/auth">
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100">
                                Sign In
                            </Button>
                        </Link>
                    </nav>
                </div>
            </div>
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="flex flex-col items-center bg-white shadow-sm w-full absolute top-16 left-0 z-10">
                    <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors py-2" to="/" onClick={toggleMenu}>
                        Home
                    </Link>
                    <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors py-2" to="/about" onClick={toggleMenu}>
                        About
                    </Link>
                    <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors py-2" to="/services" onClick={toggleMenu}>
                        Services
                    </Link>
                    <Link className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors py-2" to="/contact" onClick={toggleMenu}>
                        Contact
                    </Link>
                    <Link to="/auth" onClick={toggleMenu}>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100 my-2">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
