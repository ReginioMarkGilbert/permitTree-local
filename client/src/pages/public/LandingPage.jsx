import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTree, FaShieldAlt, FaFileAlt, FaMapMarkerAlt, FaTruck, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import Header from '../../components/Header';
import ExpandableServiceCard from '../../components/ui/ExpandableServiceCard';
import './styles/LandingPage.css';
import { fadeIn, slideUp, staggerChildren } from '../../utils/animations';

const LandingPage = () => {
    const [expandedCard, setExpandedCard] = useState(null);

    const services = [
        {
            icon: FaTree,
            title: "Tree Cutting Permits",
            description: "Apply for permits to legally cut trees, ensuring sustainable forest management practices.",
            process: [
                "Submit application form online",
                "Upload required documents (land title, site plan, etc.)",
                "Pay application fee through our secure payment system",
                "Schedule site inspection with a DENR representative",
                "Receive permit decision within 15 working days",
                "If approved, download and print your tree cutting permit"
            ],
            expandDirection: 'right-bottom'
        },
        {
            icon: FaShieldAlt,
            title: "Chainsaw Registration",
            description: "Register your chainsaw to comply with regulations and promote responsible use of forestry equipment.",
            process: [
                "Fill out online registration form",
                "Upload proof of ownership (receipt or deed of sale)",
                "Provide chainsaw specifications and photos",
                "Pay registration fee",
                "Schedule chainsaw inspection at nearest DENR office",
                "Receive digital registration certificate within 7 working days"
            ],
            expandDirection: 'center-bottom'
        },
        {
            icon: FaFileAlt,
            title: "Certificate of Verification (COV)",
            description: "Obtain a COV for transporting planted trees and non-timber forest products within private land.",
            process: [
                "Submit online application for COV",
                "Upload proof of land ownership and plantation details",
                "Provide inventory of trees/products to be transported",
                "Pay processing fee",
                "Undergo virtual verification process",
                "Receive digital COV within 5 working days",
                "Present digital or printed COV during transport"
            ],
            expandDirection: 'left-bottom'
        },
        {
            icon: FaMapMarkerAlt,
            title: "Private Tree Plantation Registration (PTPR)",
            description: "Register your private tree plantations to establish ownership and comply with DENR policies.",
            process: [
                "Complete online PTPR application form",
                "Upload land title or proof of ownership",
                "Provide detailed map and inventory of plantation",
                "Submit management plan for the plantation",
                "Pay registration fee",
                "Schedule on-site verification by DENR personnel",
                "Receive PTPR certificate within 30 days of successful verification"
            ],
            expandDirection: 'right-top'
        },
        {
            icon: FaTruck,
            title: "National Government Agency Projects",
            description: "Get permits for tree cutting or earth balling for trees affected by national government agency projects.",
            process: [
                "Submit project proposal and justification online",
                "Provide detailed environmental impact assessment",
                "Upload project plans and tree inventory",
                "Propose tree replacement or relocation plan",
                "Pay processing fee",
                "Undergo review by DENR technical committee",
                "Attend virtual consultation if required",
                "Receive decision within 45 days",
                "If approved, download special tree cutting/earth balling permit"
            ],
            expandDirection: 'center-top'
        },
        {
            icon: FaTree,
            title: "Private Land Timber Permits",
            description: "Apply for PLTP for non-premium species or SPLTP for premium/naturally-grown trees on private lands.",
            process: [
                "Choose between PLTP or SPLTP based on tree species",
                "Complete online application form",
                "Upload land title and proof of tree ownership",
                "Provide comprehensive tree inventory and harvesting plan",
                "Submit sustainable management plan for the area",
                "Pay application fee",
                "Schedule and undergo field validation by DENR",
                "Attend online seminar on sustainable harvesting practices",
                "Receive permit decision within 30 days of field validation",
                "If approved, download digital permit for immediate use"
            ],
            expandDirection: 'left-top'
        }
    ];

    const toggleExpand = (index) => {
        setExpandedCard(expandedCard === index ? null : index);
    };

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
                            {services.map((service, index) => (
                                <ExpandableServiceCard
                                    key={index}
                                    icon={service.icon}
                                    title={service.title}
                                    description={service.description}
                                    process={service.process}
                                    expandDirection={service.expandDirection}
                                    isExpanded={expandedCard === index}
                                    onToggle={() => toggleExpand(index)}
                                />
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
