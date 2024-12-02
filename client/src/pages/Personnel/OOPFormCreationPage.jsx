import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderOfPaymentForm from './components/OrderOfPaymentForm';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Creating Order of Payment...
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Please wait while we process your request
      </p>
    </div>
  </div>
);

const OOPFormCreationPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    navigate('/personnel/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {isSubmitting && <LoadingOverlay />}
      <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="flex flex-col items-center">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-800 dark:text-green-400 -mb-12`}>
            Order of Payments
          </h1>
          <OrderOfPaymentForm
            onClose={handleClose}
            onSubmitStart={() => setIsSubmitting(true)}
            onSubmitEnd={() => setIsSubmitting(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default OOPFormCreationPage;
