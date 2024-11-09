import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';

const SUBMIT_PAYMENT_PROOF = gql`
  mutation SubmitPaymentProof($oopId: ID!, $paymentProof: PaymentProofInput!) {
    submitPaymentProof(oopId: $oopId, paymentProof: $paymentProof) {
      _id
      OOPstatus
      paymentProof {
        transactionId
        status
      }
    }
  }
`;

const GCashPaymentStep = ({ oop, formData = {}, onBack }) => {
   const navigate = useNavigate();
   const [paymentStatus, setPaymentStatus] = useState('processing');
   const [countdown, setCountdown] = useState(5);
   const [submitPaymentProof] = useMutation(SUBMIT_PAYMENT_PROOF);

   useEffect(() => {
      // Simulate payment processing and generate payment proof
      const timer = setTimeout(async () => {
         try {
            const transactionId = `GCASH-${Date.now()}`;
            const referenceNumber = `REF-${Math.random().toString(36).substr(2, 9)}`;

            // Add validation for required fields
            if (!formData.fullName || !formData.email || !formData.phoneNumber) {
               throw new Error('Missing required payment details');
            }

            await submitPaymentProof({
               variables: {
                  oopId: oop._id,
                  paymentProof: {
                     transactionId,
                     paymentMethod: 'GCASH',
                     amount: oop.totalAmount,
                     referenceNumber,
                     payerDetails: {
                        name: formData.fullName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber
                     }
                  }
               }
            });

            setPaymentStatus('success');
         } catch (error) {
            console.error('Error submitting payment proof:', error);
            toast.error(error.message || 'Failed to process payment');
            setPaymentStatus('failed');
         }
      }, 3000);

      return () => clearTimeout(timer);
   }, [oop, formData, submitPaymentProof]);

   useEffect(() => {
      if (paymentStatus === 'success') {
         const interval = setInterval(() => {
            setCountdown((prev) => {
               if (prev <= 1) {
                  clearInterval(interval);
                  navigate('/applicationsStatus', {
                     state: {
                        paymentSuccess: true,
                        message: 'Payment completed successfully'
                     }
                  });
               }
               return prev - 1;
            });
         }, 1000);

         return () => clearInterval(interval);
      }
   }, [paymentStatus, navigate]);

   return (
      <Card className="w-full max-w-2xl mx-auto">
         <CardHeader>
            <CardTitle className="text-center">GCash Payment</CardTitle>
         </CardHeader>
         <CardContent className="space-y-6">
            <div className="text-center">
               {paymentStatus === 'processing' && (
                  <div className="space-y-4">
                     <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-600" />
                     <p className="text-lg font-medium">Processing your payment...</p>
                     <p className="text-sm text-gray-500">Please do not close this window</p>
                  </div>
               )}

               {paymentStatus === 'success' && (
                  <div className="space-y-4">
                     <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                        <svg
                           className="h-6 w-6 text-green-600"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                           />
                        </svg>
                     </div>
                     <p className="text-lg font-medium text-green-600">Payment Successful!</p>
                     <p className="text-sm text-gray-500">
                        Redirecting in {countdown} seconds...
                     </p>
                  </div>
               )}

               {paymentStatus === 'failed' && (
                  <div className="space-y-4">
                     <div className="h-12 w-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                        <svg
                           className="h-6 w-6 text-red-600"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                           />
                        </svg>
                     </div>
                     <p className="text-lg font-medium text-red-600">Payment Failed</p>
                     <Button
                        variant="outline"
                        onClick={onBack}
                     >
                        Try Again
                     </Button>
                  </div>
               )}
            </div>
         </CardContent>
      </Card>
   );
};

export default GCashPaymentStep;
