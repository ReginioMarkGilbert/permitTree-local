import React from 'react';
import { FaTree, FaShieldAlt, FaFileAlt, FaMapMarkerAlt, FaTruck, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerChildren } from '../../utils/animations';

const LearnMorePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <motion.main
                className="flex-1"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                {/* ... rest of the component ... */}
            </motion.main>
            <motion.footer
                className="bg-green-800 text-white py-12"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
            >
                {/* ... footer content ... */}
            </motion.footer>
        </div>
    );
};

export default LearnMorePage;
