import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import { MapPin, Phone, Mail } from 'lucide-react';
import Header from '../../components/Header';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Textarea = ({ id, name, placeholder, rows, required, value, onChange }) => (
    <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    />
);

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // console.log(`Changing ${name} to ${value}`);
        setFormData({
            ...formData,
            [name]: value
        });
        // console.log('Updated formData:', formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/contact', formData);
            toast.success(response.data.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        } catch (error) {
            toast.error('Failed to send message. Please try again later.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } }
    };

    const slideUp = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
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
                <div className="container mx-auto px-4 py-12">
                    <motion.h1
                        className="text-4xl font-bold text-green-800 mb-8 text-center"
                        variants={slideUp}
                    >
                        Contact Us
                    </motion.h1>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <p className="text-lg mb-6">
                                We're here to help! If you have any questions about our services or need assistance with your permit application, please don't hesitate to reach out to us.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <MapPin className="h-6 w-6 text-green-600 mr-2" />
                                    <span>123 Environment Street, Green City, Philippines</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-6 w-6 text-green-600 mr-2" />
                                    <span>(123) 456-7890</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="h-6 w-6 text-green-600 mr-2" />
                                    <span>info@permittree.gov.ph</span>
                                </div>
                            </div>
                            <div className="mt-8">
                                <h2 className="text-2xl font-semibold mb-4 text-green-800">Office Hours</h2>
                                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                                <p>Saturday - Sunday: Closed</p>
                            </div>
                        </div>
                        <div>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <Input id="name" name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <Input id="email" name="email" type="email" placeholder="your@email.com" required value={formData.email} onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <Input id="subject" name="subject" placeholder="Subject of your message" required value={formData.subject} onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <Textarea id="message" name="message" placeholder="Your message here" rows={5} required value={formData.message} onChange={handleChange} />
                                </div>
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">Send Message</button>
                            </form>
                        </div>
                    </div>
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

export default ContactPage;
