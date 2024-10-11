import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import OrderOfPaymentForm from './components/OrderOfPaymentForm';
import AffixEsignOOPFormModal from './components/AffixEsignOOPFormModal';
import ChiefProofOfPaymentReview from './components/ChiefProofOfPaymentReview';
import ChiefOOPFormViewModal from './components/ChiefOOPFormViewModal';
import OrderOfPaymentTable from './components/OrderOfPaymentTable';
import { useOrderOfPayments } from './hooks/useOrderOfPayments';
import { useOrderOfPaymentActions } from './hooks/useOrderOfPaymentActions';

const ChiefRPSorderOfPaymentPage = () => {
    const navigate = useNavigate();
    const { action } = useParams();
    const [activeTab, setActiveTab] = useState('Pending Signature');
    const [searchTerm, setSearchTerm] = useState('');

    const { orderOfPayments, loading, error, fetchOrderOfPayments } = useOrderOfPayments(activeTab);
    const {
        selectedOOP,
        isViewModalOpen,
        selectedOOPForReview,
        handleViewOrderOfPayment,
        handleReviewProofOfPayment,
        setIsViewModalOpen,
        setSelectedOOPForReview
    } = useOrderOfPaymentActions();

    const handleCreateOrderOfPayment = () => {
        navigate('/chief-rps/order-of-payment/create-oop');
    };

    if (action === 'create-oop') {
        return <OrderOfPaymentForm onClose={() => navigate('/chief-rps/order-of-payment')} />;
    }

    return (
        <div className="min-h-screen bg-green-50">
            <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
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
                                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
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
                        {loading && <p className="text-center text-gray-500">Loading order of payments...</p>}
                        {error && <p className="text-center text-red-500">{error}</p>}
                        {!loading && !error && (
                            <OrderOfPaymentTable
                                orderOfPayments={orderOfPayments}
                                searchTerm={searchTerm}
                                activeTab={activeTab}
                                onViewOrderOfPayment={handleViewOrderOfPayment}
                                onReviewProofOfPayment={handleReviewProofOfPayment}
                            />
                        )}
                    </CardContent>
                </Card>

                {selectedOOP && (
                    selectedOOP.status === 'Pending Signature' ? (
                        <AffixEsignOOPFormModal
                            isOpen={isViewModalOpen}
                            onClose={() => setIsViewModalOpen(false)}
                            orderOfPayment={selectedOOP}
                            refreshOrderOfPayments={fetchOrderOfPayments}
                        />
                    ) : (
                        <ChiefOOPFormViewModal
                            isOpen={isViewModalOpen}
                            onClose={() => setIsViewModalOpen(false)}
                            orderOfPayment={selectedOOP}
                        />
                    )
                )}
                {selectedOOPForReview && (
                    <ChiefProofOfPaymentReview
                        isOpen={!!selectedOOPForReview}
                        onClose={() => {
                            setSelectedOOPForReview(null);
                            fetchOrderOfPayments();
                        }}
                        oopId={selectedOOPForReview._id}
                    />
                )}
            </div>
        </div>
    );
};

export default ChiefRPSorderOfPaymentPage;
