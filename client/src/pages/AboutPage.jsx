import React from 'react';
import { Leaf, Shield, TreePine } from "lucide-react";
import Header from '../components/Header';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">About PermitTree</h1>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-lg mb-6">
                                PermitTree is the official online platform of the Department of Environment and Natural Resources - Provincial Environment and Natural Resources Office (DENR-PENRO). Our mission is to streamline the process of obtaining permits for tree-related activities while ensuring the conservation and proper management of our country's natural resources.
                            </p>
                            <p className="text-lg mb-6">
                                We understand the importance of balancing development with environmental protection. That's why we've created a user-friendly platform that makes it easier for individuals, businesses, and government agencies to apply for and obtain the necessary permits for their projects, all while adhering to environmental regulations.
                            </p>
                            <p className="text-lg">
                                Our team is committed to providing efficient, transparent, and environmentally responsible services to all our users. With PermitTree, you can be confident that your tree-related activities are in compliance with local regulations and contribute to sustainable forest management practices.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col items-center text-center">
                                <Leaf className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
                                <p>Promoting sustainable practices in all our operations</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Shield className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Secure</h3>
                                <p>Ensuring the safety and privacy of your data</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <TreePine className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Comprehensive</h3>
                                <p>Offering a wide range of tree-related permits and services</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <svg className="h-16 w-16 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <h3 className="text-xl font-semibold mb-2">Efficient</h3>
                                <p>Streamlining processes for faster permit issuance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
