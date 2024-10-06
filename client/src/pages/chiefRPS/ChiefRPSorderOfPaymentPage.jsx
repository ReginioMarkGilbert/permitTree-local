import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'react-toastify';
import { Leaf, Eye, FileText } from "lucide-react";
import OrderOfPaymentForm from './components/OrderOfPaymentForm';
import OrderOfPaymentViewModal from './components/OrderOfPaymentViewModal';

const ChiefRPSorderOfPaymentPage = () => {
    const navigate = useNavigate();
    const { action } = useParams();
    const [activeTab, setActiveTab] = useState('Pending Signature');
    const [orderOfPayments, setOrderOfPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOOP, setSelectedOOP] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        if (action !== 'create-oop') {
            fetchOrderOfPayments();
        }
    }, [activeTab, action]);

    const fetchOrderOfPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/order-of-payments', {
                headers: { Authorization: token },
                params: { status: activeTab }
            });
            setOrderOfPayments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order of payments:', error);
            setError('Failed to fetch order of payments');
            setLoading(false);
            toast.error('Failed to fetch order of payments');
        }
    };

    const handleCreateOrderOfPayment = () => {
        navigate('/chief-rps/order-of-payment/create-oop');
    };

    const handleViewOrderOfPayment = (orderOfPayment) => {
        setSelectedOOP(orderOfPayment);
        setIsViewModalOpen(true);
    };

    const renderTable = () => {
        if (loading) {
            return <p className="text-center text-gray-500">Loading order of payments...</p>;
        }

        if (error) {
            return <p className="text-center text-red-500">{error}</p>;
        }

        if (orderOfPayments.length === 0) {
            return <p className="text-center text-gray-500">No order of payments found.</p>;
        }

        const filteredOrderOfPayments = orderOfPayments.filter(oop =>
            oop.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            oop.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Applicant Name</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrderOfPayments.map((oop) => (
                        <TableRow key={oop._id}>
                            <TableCell>{oop.applicationId}</TableCell>
                            <TableCell>{oop.applicantName}</TableCell>
                            <TableCell>{new Date(oop.dateCreated).toLocaleDateString()}</TableCell>
                            <TableCell>{oop.status}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleViewOrderOfPayment(oop)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="min-h-screen bg-green-50">

            <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
                {action === 'create-oop' ? (
                    <OrderOfPaymentForm onClose={() => navigate('/chief-rps/order-of-payment')} />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-green-800">Order of Payments</h1>
                            <Button onClick={handleCreateOrderOfPayment}>
                                <FileText className="mr-2 h-4 w-4" />
                                Create Order of Payment
                            </Button>
                        </div>

                        <div className="mb-6 overflow-x-auto">
                            <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                                {['Pending Signature', 'Awaiting Payment', 'Payment Proof Submitted', 'Completed'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search order of payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border rounded-md p-2 w-full"
                            />
                        </div>

                        <Card>
                            <CardContent>
                                {renderTable()}
                            </CardContent>
                        </Card>
                        {selectedOOP && (
                            <OrderOfPaymentViewModal
                                isOpen={isViewModalOpen}
                                onClose={() => setIsViewModalOpen(false)}
                                orderOfPayment={selectedOOP}
                                refreshOrderOfPayments={fetchOrderOfPayments}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ChiefRPSorderOfPaymentPage;
