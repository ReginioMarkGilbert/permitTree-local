import React from 'react';
import { Leaf, Shield, TreePine } from "lucide-react";
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerChildren } from '../../utils/animations';

const AboutPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <motion.main
                className="flex-1 mb-14"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="container mx-auto px-4 py-12">
                    <motion.h1
                        className="text-4xl font-bold text-green-800 mb-14 text-center"
                        variants={slideUp}
                    >
                        About PermitTree
                    </motion.h1>
                    <motion.div
                        className="grid md:grid-cols-2 gap-12 items-center"
                        variants={staggerChildren}
                    >
                        <motion.div variants={slideUp}>
                            <p className="text-lg mb-6">
                                <span className="font-bold">PermitTree</span> is the official online permit issuance and management system of the Department of Environment and Natural Resources - Provincial Environment and Natural Resources Office (DENR-PENRO). Our mission is to streamline the process of obtaining permits for tree-related activities while ensuring the conservation and proper management of our country's natural resources.
                            </p>
                            <p className="text-lg mb-6">
                                We understand the importance of balancing development with environmental protection. That's why we've created a user-friendly platform that makes it easier for individuals, businesses, and government agencies to apply for and obtain the necessary permits for their projects, all while adhering to environmental regulations.
                            </p>
                            <p className="text-lg">
                                Our team is committed to providing efficient, transparent, and environmentally responsible services to all our users. With PermitTree, you can be confident that your tree-related activities are in compliance with local regulations and contribute to sustainable forest management practices.
                            </p>
                        </motion.div>
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center"
                            variants={staggerChildren}
                        >
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <Leaf className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
                                <p>Promoting sustainable practices in all our operations</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <Shield className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Secure</h3>
                                <p>Ensuring the safety and privacy of your data</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <TreePine className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Comprehensive</h3>
                                <p>Offering a wide range of tree-related permits and services</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                <svg className="h-16 w-16 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <h3 className="text-xl font-semibold mb-2">Efficient</h3>
                                <p>Streamlining processes for faster permit issuance</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.main>
            <motion.footer
                className="bg-green-800 text-white py-12"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
            >
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">About PermitTree</h3>
                            <p className="text-sm">
                                PermitTree is the official online platform of DENR-PENRO for processing tree-related permits
                                and registrations, committed to the conservation and proper management of the country's natural resources.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link to="/" className="text-sm hover:underline">Home</Link></li>
                                <li><Link to="/about" className="text-sm hover:underline">About</Link></li>
                                <li><Link to="/services" className="text-sm hover:underline">Services</Link></li>
                                <li><Link to="/contact" className="text-sm hover:underline">Contact</Link></li>
                                <li><Link to="#" className="text-sm hover:underline">Privacy Policy</Link></li>
                                <li><Link to="#" className="text-sm hover:underline">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                            <div className="flex space-x-4 mb-4">
                                <Link to="#" className="hover:text-green-300">
                                    <FaFacebook className="h-6 w-6" />
                                </Link>
                                <Link to="#" className="hover:text-green-300">
                                    <FaTwitter className="h-6 w-6" />
                                </Link>
                                <Link to="#" className="hover:text-green-300">
                                    <FaInstagram className="h-6 w-6" />
                                </Link>
                            </div>
                            <p className="text-sm">
                                Email: info@permittree.gov.ph<br />
                                Phone: (123) 456-7890
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-green-700 text-center">
                        <p className="text-sm">&copy; 2023 PermitTree - DENR-PENRO. All rights reserved.</p>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default AboutPage;
