import React from 'react';
import { FaTree, FaShieldAlt, FaFileAlt, FaMapMarkerAlt, FaTruck, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
// import '../styles/LearnMorePage.css';

const LearnMorePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <main className="flex-1">
                <section className="bg-green-100 py-20">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold text-green-800 mb-4 text-center">About PermitTree</h1>
                        <p className="text-xl text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                            Discover how PermitTree is revolutionizing the way we manage tree-related permits and registrations,
                            ensuring sustainable practices and environmental protection.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/auth">
                                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">Our Mission</h2>
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-green-800 mb-4">Streamlined Permitting</h3>
                                <p className="text-gray-600">
                                    We aim to simplify the process of obtaining tree-related permits and registrations,
                                    making it easier for individuals and organizations to comply with regulations while
                                    promoting responsible forest management. Our user-friendly platform reduces bureaucracy
                                    and accelerates the application process, saving time and resources for all stakeholders.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-green-800 mb-4">Environmental Protection</h3>
                                <p className="text-gray-600">
                                    By facilitating proper permitting and registration, we contribute to the conservation
                                    of our forests and natural resources, ensuring sustainable practices for generations to come.
                                    Our platform encourages responsible tree management, promotes reforestation efforts, and
                                    helps maintain the delicate balance of our ecosystems.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-green-50 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">How It Works</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg">
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 rounded-full p-4 mb-4">
                                        <FaFileAlt className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">1. Apply Online</h3>
                                    <p className="text-gray-600 text-center">
                                        Submit your application through our user-friendly online platform.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg">
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 rounded-full p-4 mb-4">
                                        <FaShieldAlt className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">2. Review Process</h3>
                                    <p className="text-gray-600 text-center">
                                        DENR personnel reviews the application to ensure compliance with regulations.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg">
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 rounded-full p-4 mb-4">
                                        <FaTree className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">3. Receive Permit</h3>
                                    <p className="text-gray-600 text-center">
                                        Once approved, receive your digital permit or registration certificate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-green-200 py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-green-800 mb-8">Ready to Get Started?</h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join PermitTree today and experience a smoother, more efficient way to manage your tree-related permits and registrations.
                        </p>
                        <Link to="/auth">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-8 py-3 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1">
                                Create an Account
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="bg-green-800 text-white py-12">
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
            </footer>
        </div>
    );
};

export default LearnMorePage;
