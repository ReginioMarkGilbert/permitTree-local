import React from 'react';
import { TreePine, Shield, FileText, MapPin, Truck } from "lucide-react";
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

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

    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Our Services</h1>
                    <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
                        PermitTree offers a comprehensive range of services to help you manage your tree-related activities in compliance with environmental regulations. Explore our services below:
                    </p>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                                {service.icon}
                                <h3 className="text-xl font-semibold mt-4 mb-2 text-green-800">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <footer className="bg-green-800 text-white py-12">
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
            </footer>
        </div>
    );
}
