import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const GCashPaymentStep = ({ oop, onBack }) => {
   const navigate = useNavigate();
   const [paymentStatus, setPaymentStatus] = useState('processing'); // processing, success, failed
   const [countdown, setCountdown] = useState(5);

   useEffect(() => {
      // Simulate payment processing
      const timer = setTimeout(() => {
         setPaymentStatus('success');
      }, 3000);

      return () => clearTimeout(timer);
   }, []);

   useEffect(() => {
      if (paymentStatus === 'success') {
         const interval = setInterval(() => {
            setCountdown((prev) => {
               if (prev <= 1) {
                  clearInterval(interval);
                  navigate('/applicationsStatus');
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

               <div className="mt-8">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={onBack}
                     disabled={paymentStatus === 'success'}
                  >
                     Back
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

export default GCashPaymentStep;
