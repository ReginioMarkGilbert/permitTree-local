import React from 'react';
import { TreePine, Shield, FileText, MapPin, Truck } from "lucide-react";
import Header from '../components/Header';

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
        </div>
    );
}
