import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';
import OrderOfPaymentForm from './components/OrderOfPaymentForm';

const OOPFormCreationPage = () => {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen bg-green-50">
          <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
              <div className="flex flex-col items-center mb-6">
                  <h1 className="text-3xl font-bold text-green-800 mb-4">Order of Payments</h1>
                  <OrderOfPaymentForm onClose={() => navigate('/personnel/order-of-payment')} />
              </div>
          </div>
      </div>
  );
};

export default OOPFormCreationPage;
