import React from 'react';
// import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { MapPin, Phone, Mail } from 'lucide-react';
import Header from '../components/Header';

const ContactPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Contact Us</h1>
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
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <Input id="name" placeholder="Your Name" required />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <Input id="email" type="email" placeholder="your@email.com" required />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <Input id="subject" placeholder="Subject of your message" required />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <Textarea id="message" placeholder="Your message here" rows={5} required />
                                </div>
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
