import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { format } from "date-fns";

const REVIEW_PAYMENT_PROOF = gql`
  mutation ReviewPaymentProof($oopId: ID!, $status: String!, $notes: String) {
    reviewPaymentProof(oopId: $oopId, status: $status, notes: $notes) {
      _id
      OOPstatus
      paymentProof {
        transactionId
        paymentMethod
        amount
        timestamp
        referenceNumber
        payerDetails {
          name
          email
          phoneNumber
        }
        status
      }
      namePayee
      billNo
      applicationId
      totalAmount
      createdAt
      updatedAt
    }
  }
`;

const ReviewPaymentModal = ({ oop, isOpen, onClose, onReviewComplete }) => {
   const [notes, setNotes] = useState('');
   const [reviewPaymentProof] = useMutation(REVIEW_PAYMENT_PROOF);

   useEffect(() => {
      console.log('Full OOP data in ReviewPaymentModal:', oop);
      console.log('Payment Proof data:', oop?.paymentProof);
      console.log('OOP Status:', oop?.OOPstatus);
   }, [oop]);

   const formatDate = (timestamp) => {
      try {
         const date = typeof timestamp === 'string' ?
            new Date(timestamp.includes('T') ? timestamp : parseInt(timestamp)) :
            new Date(timestamp);

         return format(date, 'PPpp');
      } catch (error) {
         console.error('Error formatting date:', error);
         return 'Invalid date';
      }
   };

   const handleReview = async (status) => {
      try {
         const { data } = await reviewPaymentProof({
            variables: {
               oopId: oop._id,
               status: status,
               notes: notes
            }
         });

         if (data.reviewPaymentProof) {
            toast.success(`Payment proof ${status.toLowerCase()} successfully`);
            onReviewComplete();
            onClose();
         }
      } catch (error) {
         console.error('Error reviewing payment proof:', error);
         toast.error('Failed to review payment proof');
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-2xl">
            <DialogHeader>
               <DialogTitle>Review Payment Proof</DialogTitle>
               <DialogDescription>
                  Review the payment proof details and verify the payment.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
               {/* Application Details */}
               <div>
                  <Label>Application Details</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                     <div>
                        <span className="font-medium">Application No:</span> {oop.applicationId}
                     </div>
                     <div>
                        <span className="font-medium">Bill No:</span> {oop.billNo}
                     </div>
                     <div>
                        <span className="font-medium">Amount:</span> ₱{oop.totalAmount?.toFixed(2)}
                     </div>
                  </div>
               </div>

               {/* Payment Proof Details */}
               {oop.paymentProof ? (
                  <div className="space-y-4">
                     <Label>Payment Proof Details</Label>
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                           <div className="font-medium">Transaction ID:</div>
                           <div>{oop.paymentProof.transactionId}</div>

                           <div className="font-medium">Reference Number:</div>
                           <div>{oop.paymentProof.referenceNumber}</div>

                           <div className="font-medium">Amount:</div>
                           <div>₱{oop.paymentProof.amount.toFixed(2)}</div>

                           <div className="font-medium">Payment Method:</div>
                           <div>{oop.paymentProof.paymentMethod}</div>

                           <div className="font-medium">Date:</div>
                           <div>{formatDate(oop.paymentProof.timestamp)}</div>

                           <div className="font-medium">Status:</div>
                           <div>{oop.paymentProof.status}</div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                           <h4 className="font-medium mb-2">Payer Details</h4>
                           <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="font-medium">Name:</div>
                              <div>{oop.paymentProof.payerDetails.name}</div>

                              <div className="font-medium">Email:</div>
                              <div>{oop.paymentProof.payerDetails.email}</div>

                              <div className="font-medium">Phone:</div>
                              <div>{oop.paymentProof.payerDetails.phoneNumber}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md text-gray-500">
                     No payment proof available
                  </div>
               )}

               {/* Notes */}
               <div>
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                     id="notes"
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="Add any notes about the payment verification..."
                     className="mt-2"
                  />
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                     Cancel
                  </Button>
                  <Button
                     variant="destructive"
                     onClick={() => handleReview('REJECTED')}
                  >
                     Reject
                  </Button>
                  <Button
                     onClick={() => handleReview('APPROVED')}
                     className="bg-green-600 hover:bg-green-700"
                  >
                     Approve
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ReviewPaymentModal;
