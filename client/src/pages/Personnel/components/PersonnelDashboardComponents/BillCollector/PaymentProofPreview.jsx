import React from 'react';
import { format } from "date-fns";

const PaymentProofPreview = ({ paymentProof }) => {
   if (!paymentProof) return null;

   const formatDate = (timestamp) => {
      try {
         // Check if timestamp is a string that needs parsing
         const date = typeof timestamp === 'string' ?
            new Date(timestamp.includes('T') ? timestamp : parseInt(timestamp)) :
            new Date(timestamp);

         return format(date, 'PPpp');
      } catch (error) {
         console.error('Error formatting date:', error);
         return 'Invalid date';
      }
   };

   return (
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
         <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Transaction ID:</div>
            <div>{paymentProof.transactionId}</div>

            <div className="font-medium">Reference Number:</div>
            <div>{paymentProof.referenceNumber}</div>

            <div className="font-medium">Amount:</div>
            <div>₱{paymentProof.amount.toFixed(2)}</div>

            <div className="font-medium">Payment Method:</div>
            <div>{paymentProof.paymentMethod}</div>

            <div className="font-medium">Date:</div>
            <div>{formatDate(paymentProof.timestamp)}</div>
         </div>

         <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Payer Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
               <div className="font-medium">Name:</div>
               <div>{paymentProof.payerDetails.name}</div>

               <div className="font-medium">Email:</div>
               <div>{paymentProof.payerDetails.email}</div>

               <div className="font-medium">Phone:</div>
               <div>{paymentProof.payerDetails.phoneNumber}</div>
            </div>
         </div>
      </div>
   );
};

export default PaymentProofPreview;
