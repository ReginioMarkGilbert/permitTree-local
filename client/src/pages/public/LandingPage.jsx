import React from 'react';
import { Link } from 'react-router-dom';
import { FaTree, FaShieldAlt, FaFileAlt, FaMapMarkerAlt, FaTruck, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import Header from '../../components/Header';
import './styles/LandingPage.css';
import { fadeIn, slideUp, staggerChildren } from '../../utils/animations';

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <motion.main
                className="flex-1"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <motion.section
                    className="bg-green-100 py-20"
                    variants={fadeIn}
                >
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="max-w-3xl mx-auto text-center"
                            variants={staggerChildren}
                        >
                            <motion.h1
                                className="text-4xl font-bold text-green-800 mb-4"
                                variants={slideUp}
                            >
                                Welcome to PermitTree
                            </motion.h1>
                            <motion.p
                                className="text-xl text-gray-600 mb-8"
                                variants={slideUp}
                            >
                                Streamlined permitting for tree-related activities. Protecting our environment, one permit at a time.
                            </motion.p>
                            <motion.div
                                className="space-x-4"
                                variants={slideUp}
                            >
                                <Link to="/auth">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
                                </Link>
                                <Link to="/learnMore">
                                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100">
                                        Learn More
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>
                <motion.section
                    className="py-20"
                    variants={fadeIn}
                >
                    <div className="container mx-auto px-4">
                        <motion.h2
                            className="text-3xl font-bold text-green-800 text-center mb-12"
                            variants={slideUp}
                        >
                            Our Services
                        </motion.h2>
                        <motion.div
                            className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            variants={staggerChildren}
                        >
                            {[
                                { icon: FaTree, title: "Tree Cutting Permits", description: "Apply for permits to legally cut trees, ensuring sustainable forest management practices." },
                                { icon: FaShieldAlt, title: "Chainsaw Registration", description: "Register your chainsaw to comply with regulations and promote responsible use of forestry equipment." },
                                { icon: FaFileAlt, title: "Certificate of Verification (COV)", description: "Obtain a COV for transporting planted trees and non-timber forest products within private land." },
                                { icon: FaMapMarkerAlt, title: "Private Tree Plantation Registration (PTPR)", description: "Register your private tree plantations to establish ownership and comply with DENR policies." },
                                { icon: FaTruck, title: "National Government Agency Projects", description: "Get permits for tree cutting or earth balling for trees affected by national government agency projects." },
                                { icon: FaTree, title: "Private Land Timber Permits", description: "Apply for PLTP for non-premium species or SPLTP for premium/naturally-grown trees on private lands." }
                            ].map((service, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md"
                                    variants={slideUp}
                                >
                                    <service.icon className="h-12 w-12 text-green-600 mb-4" />
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">{service.title}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>
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
                                PermitTree is the official online platform of DENR-PENRO (Department of Environment and Natural Resources - Provincial Environment and Natural Resources Office)
                                for processing tree-related permits and registrations, committed to the conservation and proper management of the country's natural resources.
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

export default LandingPage;
