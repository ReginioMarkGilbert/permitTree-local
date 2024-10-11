import { useState } from 'react';

export const useOrderOfPaymentActions = () => {
    const [selectedOOP, setSelectedOOP] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOOPForReview, setSelectedOOPForReview] = useState(null);

    const handleViewOrderOfPayment = (orderOfPayment) => {
        setSelectedOOP(orderOfPayment);
        setIsViewModalOpen(true);
    };

    const handleReviewProofOfPayment = (oop) => {
        setSelectedOOPForReview(oop);
    };

    return {
        selectedOOP,
        isViewModalOpen,
        selectedOOPForReview,
        handleViewOrderOfPayment,
        handleReviewProofOfPayment,
        setIsViewModalOpen,
        setSelectedOOPForReview
    };
};
