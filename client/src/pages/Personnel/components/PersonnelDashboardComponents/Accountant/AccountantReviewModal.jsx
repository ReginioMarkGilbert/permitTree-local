import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { GET_ALL_OOPS } from '../../../hooks/useOrderOfPayments';

const APPROVE_OOP = gql`
  mutation ApproveOOP(
    $id: ID!,
    $notes: String!,
    $status: String!
  ) {
    approveOOP(
      id: $id,
      notes: $notes,
      status: $status
    ) {
      _id
      OOPstatus
      OOPSignedByTwoSignatories
      OOPApproved
    }
  }
`;

const AccountantReviewModal = ({ isOpen, onClose, oop, onReviewComplete }) => {
   const [isRejecting, setIsRejecting] = useState(false);
   const [remarks, setRemarks] = useState('');
   const [approveOOP] = useMutation(APPROVE_OOP);

   const handleApprove = async () => {
      try {
         if (!oop || !oop._id) {
            throw new Error('Invalid OOP data');
         }
         const result = await approveOOP({
            variables: {
               id: oop._id,
               notes: 'Order of Payment approved by Accountant',
               status: 'Awaiting Payment' // will be sent to client for payment
            },
            refetchQueries: [{ query: GET_ALL_OOPS }]
         });
         console.log('Result:', result);
         onReviewComplete();
         onClose();
         toast.success('Order of Payment approved successfully');
      } catch (error) {
         console.error('Error approving OOP:', error);
         toast.error(`Error approving OOP: ${error.message}`);
      }
   };

   const handleReject = async () => {
      if (!remarks.trim()) {
         toast.error('Please provide remarks for rejecting the Order of Payment.');
         return;
      }
      try {
         if (!oop || !oop._id) {
            throw new Error('Invalid OOP data');
         }
         const result = await approveOOP({
            variables: {
               id: oop._id,
               notes: remarks,
               status: 'Rejected'
            },
            refetchQueries: [{ query: GET_ALL_OOPS }]
         });
         console.log('Result:', result);
         onReviewComplete();
         onClose();
         toast.success('Order of Payment rejected successfully');
      } catch (error) {
         console.error('Error rejecting OOP:', error);
         toast.error(`Error rejecting OOP: ${error.message}`);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Review Order of Payment</DialogTitle>
               <DialogDescription>
                  Bill No: {oop?.billNo}
                  <br />
                  Application Number: {oop?.applicationId}
                  <br />
                  Total Amount: ₱ {oop?.totalAmount?.toFixed(2)}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
               {isRejecting ? (
                  <>
                     <textarea
                        data-testid="reject-remarks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="Enter remarks for rejecting the Order of Payment"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                     />
                     <Button
                        data-testid="confirm-reject"
                        onClick={handleReject}
                        className="w-full bg-red-600 hover:bg-red-700"
                     >
                        Confirm Rejection
                     </Button>
                     <Button
                        data-testid="cancel-reject"
                        onClick={() => setIsRejecting(false)}
                        variant="outline"
                        className="w-full"
                     >
                        Cancel
                     </Button>
                  </>
               ) : (
                  <>
                     <Button
                        data-testid="approve-button"
                        onClick={handleApprove}
                        className="w-full bg-green-600 hover:bg-green-700"
                     >
                        Approve Order of Payment
                     </Button>
                     <Button
                        data-testid="reject-button"
                        onClick={() => setIsRejecting(true)}
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                     >
                        Reject
                     </Button>
                  </>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default AccountantReviewModal;
