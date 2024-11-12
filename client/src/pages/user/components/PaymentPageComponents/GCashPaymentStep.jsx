import React, { useState, useEffect, useRef } from 'react';
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
   const redirectTimeoutRef = useRef(null);
   const paymentProcessed = useRef(false);

   useEffect(() => {
      let timer;

      const processPayment = async () => {
         if (paymentProcessed.current) return;

         try {
            const transactionId = `GCASH-${Date.now()}`;
            const referenceNumber = `REF-${Math.random().toString(36).substr(2, 9)}`;

            if (!formData.fullName || !formData.email || !formData.phoneNumber) {
               throw new Error('Missing required payment details');
            }

            paymentProcessed.current = true; // Mark as processed before the API call

            const result = await submitPaymentProof({
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

            if (result.data?.submitPaymentProof) {
               setPaymentStatus('success');
               startCountdown();
            }
         } catch (error) {
            console.error('Error submitting payment proof:', error);
            toast.error(error.message || 'Failed to process payment');
            setPaymentStatus('failed');
            paymentProcessed.current = false; // Reset if failed
         }
      };

      timer = setTimeout(processPayment, 3000);

      return () => {
         clearTimeout(timer);
      };
   }, []); // Empty dependency array since we only want this to run once

   const startCountdown = () => {
      let count = 5;
      const interval = setInterval(() => {
         count--;
         setCountdown(count);

         if (count <= 0) {
            clearInterval(interval);
            navigate('/applicationsStatus', {
               replace: true,
               state: {
                  paymentSuccess: true,
                  message: 'Payment completed successfully'
               }
            });
         }
      }, 1000);

      return () => clearInterval(interval);
   };

   // Clean up on unmount
   useEffect(() => {
      return () => {
         if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
         }
      };
   }, []);

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
