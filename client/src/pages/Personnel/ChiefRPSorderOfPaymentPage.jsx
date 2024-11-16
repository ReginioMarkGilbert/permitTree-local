import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import OrderOfPaymentForm from './components/OrderOfPaymentForm';
// import AffixEsignOOPFormModal from './components/AffixEsignOOPFormModal';
// import ChiefProofOfPaymentReview from './components/ChiefProofOfPaymentReview';
// import ChiefOOPFormViewModal from './components/ChiefOOPFormViewModal';
// import OrderOfPaymentTable from './components/OrderOfPaymentTable';
// import { useOrderOfPayments } from './hooks/useOrderOfPayments';
// import { useOrderOfPaymentActions } from './hooks/useOrderOfPaymentActions';

const ChiefRPSorderOfPaymentPage = () => {
    const navigate = useNavigate();
    const { action } = useParams();
    // const [activeTab, setActiveTab] = useState('Pending Signature');
    // const [searchTerm, setSearchTerm] = useState('');

    // const { orderOfPayments, loading, error, fetchOrderOfPayments } = useOrderOfPayments(activeTab);
    // const {
    //     selectedOOP,
    //     isViewModalOpen,
    //     selectedOOPForReview,
    //     handleViewOrderOfPayment,
    //     handleReviewProofOfPayment,
    //     setIsViewModalOpen,
    //     setSelectedOOPForReview
    // } = useOrderOfPaymentActions();

    const handleCreateOrderOfPayment = () => {
        navigate('/personnel/order-of-payment/create-oop');
    };

    if (action === 'create-oop') {
        return <OrderOfPaymentForm onClose={() => navigate('/personnel/order-of-payment')} />;
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
            </div>
        </div>
    );
};

export default ChiefRPSorderOfPaymentPage;
