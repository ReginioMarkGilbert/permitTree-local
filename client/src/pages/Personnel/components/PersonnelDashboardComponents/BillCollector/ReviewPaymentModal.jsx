import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const VERIFY_OOP_PAYMENT = gql`
  mutation ApproveOOP($id: ID!, $status: String!, $notes: String) {
    approveOOP(id: $id, status: $status, notes: $notes) {
      _id
      OOPstatus
    }
  }
`;

const ReviewPaymentModal = ({ oop, isOpen, onClose, onReviewComplete }) => {
   const [notes, setNotes] = useState('');
   const [verifyOOPPayment] = useMutation(VERIFY_OOP_PAYMENT);

   const handleVerify = async (status) => {
      try {
         const { data } = await verifyOOPPayment({
            variables: {
               id: oop._id,
               status: status === 'VERIFIED' ? 'Completed OOP' : 'Payment Proof Rejected',
               notes: notes
            }
         });

         if (data.approveOOP) {
            toast.success(`Payment ${status === 'VERIFIED' ? 'approved' : 'rejected'} successfully`);
            onReviewComplete();
            onClose();
         }
      } catch (error) {
         console.error('Error verifying payment:', error);
         toast.error('Failed to verify payment');
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Review Payment Proof</DialogTitle>
               <DialogDescription>
                  Please review the payment proof and approve or reject it.
               </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                  <Label>Application Details</Label>
                  <div className="text-sm">
                     <p><span className="font-medium">Application No:</span> {oop.applicationId}</p>
                     <p><span className="font-medium">Bill No:</span> {oop.billNo}</p>
                     <p><span className="font-medium">Amount:</span> ₱{oop.totalAmount?.toFixed(2)}</p>
                  </div>
               </div>

               <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                     id="notes"
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="Add any notes about the payment proof..."
                  />
               </div>

               {/* Payment Proof Preview would go here */}
               <div className="grid gap-2">
                  <Label>Payment Proof</Label>
                  <div className="bg-gray-100 p-4 rounded-md text-center text-sm text-gray-500">
                     Payment proof preview placeholder
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2">
               <Button
                  variant="outline"
                  onClick={onClose}
               >
                  Cancel
               </Button>
               <Button
                  variant="destructive"
                  onClick={() => handleVerify('REJECTED')}
               >
                  Reject
               </Button>
               <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerify('VERIFIED')}
               >
                  Approve
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ReviewPaymentModal;
