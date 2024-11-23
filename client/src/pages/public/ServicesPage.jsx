import React, { useState } from 'react';
import { TreePine, Shield, FileText, MapPin, Truck, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import Header from '@/components/Header';
import DENRHeader from './components/DENRHeader'; // Add this import
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerChildren } from '@/utils/animations';

export default function ServicesPage() {
    const services = [
        {
            icon: <TreePine className="h-12 w-12 text-green-600" />,
            title: "Tree Cutting Permits",
            description: "Apply for permits to legally cut trees, ensuring sustainable forest management practices."
        },
        {
            icon: <Shield className="h-12 w-12 text-green-600" />,
            title: "Chainsaw Registration",
            description: "Register your chainsaw to comply with regulations and promote responsible use of forestry equipment."
        },
        {
            icon: <FileText className="h-12 w-12 text-green-600" />,
            title: "Certificate of Verification (COV)",
            description: "Obtain a COV for transporting planted trees and non-timber forest products within private land."
        },
        {
            icon: <MapPin className="h-12 w-12 text-green-600" />,
            title: "Private Tree Plantation Registration (PTPR)",
            description: "Register your private tree plantations to establish ownership and comply with DENR policies."
        },
        {
            icon: <Truck className="h-12 w-12 text-green-600" />,
            title: "National Government Agency Projects",
            description: "Get permits for tree cutting or earth balling for trees affected by national government agency projects."
        },
        {
            icon: <TreePine className="h-12 w-12 text-green-600" />,
            title: "Private Land Timber Permits",
            description: "Apply for PLTP for non-premium species or SPLTP for premium/naturally-grown trees on private lands."
        }
    ];

    const faqs = [
        {
            question: "How long does it take to process a tree cutting permit?",
            answer: "Processing times vary, but typically it takes 5-10 working days for a standard application. Complex cases may require additional time."
        },
        {
            question: "Do I need to register my chainsaw even if I only use it on my private property?",
            answer: "Yes, all chainsaws must be registered regardless of where they are used. This is in compliance with Republic Act No. 9175 or the Chainsaw Act of 2002."
        },
        {
            question: "What documents do I need to apply for a Private Land Timber Permit?",
            answer: "Required documents typically include proof of land ownership, a sketch map of the area, an inventory of trees to be cut, and a development plan for the land. Specific requirements may vary, so it's best to check with our office for the most up-to-date list."
        },
        {
            question: "How often do I need to renew my chainsaw registration?",
            answer: "Chainsaw registrations are valid for two years and must be renewed before expiration. It's advisable to start the renewal process at least a month before your current registration expires."
        },
        {
            question: "Is there a fee for obtaining a Certificate of Verification (COV)?",
            answer: "Yes, there is a nominal processing fee for COVs. The exact amount can vary, so please contact our office for the current fee structure."
        },
        {
            question: "Can I apply for these permits and registrations online?",
            answer: "We are in the process of developing an online application system. Currently, some initial steps can be done online, but you may need to visit our office to complete the process. Check our website for the most current application procedures."
        },
        {
            question: "What happens if I cut a tree without a permit?",
            answer: "Cutting trees without proper permits is illegal and can result in fines and legal consequences. It's always best to obtain the necessary permits before any tree-cutting activity."
        },
        {
            question: "How do I know if the trees on my property are considered 'premium' species?",
            answer: "Premium tree species are defined by DENR regulations and include trees like narra, molave, and kamagong. Our office can provide a full list and help you identify the species on your property."
        }
    ];

    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <DENRHeader /> {/* Add the DENRHeader component here */}
            <motion.main
                className="flex-1"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="container mx-auto px-4 py-12">
                    <motion.h1
                        className="text-4xl font-bold text-green-800 mb-8 text-center"
                        variants={slideUp}
                    >
                        Our Services
                    </motion.h1>
                    <motion.p
                        className="text-lg text-center mb-12 max-w-3xl mx-auto"
                        variants={slideUp}
                    >
                        DENR PENRO Marinduque offers a comprehensive range of services to help you manage your tree-related activities in compliance with environmental regulations. Our dedicated team, led by OIC For. Imelda M. Diaz, is committed to protecting and conserving Marinduque's natural resources.
                    </motion.p>

                    {/* Existing services grid */}
                    <motion.div
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16"
                        variants={staggerChildren}
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center"
                                variants={slideUp}
                            >
                                {service.icon}
                                <h3 className="text-xl font-semibold mt-4 mb-2 text-green-800">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Call-to-Action Section */}
                    <motion.div
                        className="bg-green-600 text-white p-8 rounded-lg shadow-lg mb-16"
                        variants={fadeIn}
                    >
                        <h2 className="text-3xl font-bold mb-4 text-center">Ready to Apply?</h2>
                        <p className="text-center mb-6">Start your application process online or contact us for more information.</p>
                        <div className="flex justify-center space-x-4">
                            <Link to="/apply" className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold hover:bg-green-100 transition duration-300">Apply Now</Link>
                            <Link to="/contact" className="border-2 border-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition duration-300">Contact Us</Link>
                        </div>
                    </motion.div>

                    {/* Updated FAQ Section */}
                    <motion.div
                        className="mb-16"
                        variants={fadeIn}
                    >
                        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            {faqs.map((faq, index) => (
                                <div key={index} className="mb-4 border-b border-gray-200 last:border-b-0">
                                    <button
                                        className="flex justify-between items-center w-full py-4 text-left"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <h3 className="text-xl font-semibold text-green-800">{faq.question}</h3>
                                        {openFaq === index ? (
                                            <ChevronUp className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <ChevronDown className="h-6 w-6 text-green-600" />
                                        )}
                                    </button>
                                    {openFaq === index && (
                                        <p className="text-gray-600 pb-4">{faq.answer}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        className="bg-white p-8 rounded-lg shadow-lg mb-16"
                        variants={fadeIn}
                    >
                        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Get in Touch</h2>
                        <div className="flex justify-center space-x-8">
                            <div className="flex items-center">
                                <Phone className="h-6 w-6 text-green-600 mr-2" />
                                <span>(123) 456-7890</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="h-6 w-6 text-green-600 mr-2" />
                                <span>info@denrpenromarinduque.gov.ph</span>
                            </div>
                        </div>
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
}
