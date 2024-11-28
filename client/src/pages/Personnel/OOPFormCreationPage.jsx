import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button } from "@/components/ui/button";
// import { FileText } from 'lucide-react';
import OrderOfPaymentForm from './components/OrderOfPaymentForm';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const OOPFormCreationPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const handleClose = () => {
    navigate('/personnel/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="flex flex-col items-center">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-800 dark:text-green-400 -mb-12`}>
            Order of Payments
          </h1>
          <OrderOfPaymentForm onClose={handleClose} />
        </div>
      </div>
    </div>
  );
};

export default OOPFormCreationPage;
