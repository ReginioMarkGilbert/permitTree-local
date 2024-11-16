import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const REVIEW_APPLICATION = gql`
  mutation ReviewApplication(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $reviewedByChief: Boolean,
    $awaitingOOP: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      reviewedByChief: $reviewedByChief,
      awaitingOOP: $awaitingOOP
    ) {
      id
      currentStage
      status
      reviewedByChief
      awaitingOOP
      history {
        notes
        timestamp
      }
    }
  }
`;

const ChiefReviewModal = ({ isOpen, onClose, application, onReviewComplete }) => {
   const [isReturning, setIsReturning] = useState(false);
   const [remarks, setRemarks] = useState('');
   const [reviewApplication] = useMutation(REVIEW_APPLICATION);

   const handleApprove = async () => {
      try {
         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }
         const result = await reviewApplication({
            variables: {
               id: application.id,
               currentStage: 'ForInspectionByTechnicalStaff',
               status: 'In Progress',
               notes: 'Application approved by Chief RPS, ready for Order of Payment creation',
               reviewedByChief: true,
               awaitingOOP: true
            }
         });
         console.log('Result:', result);
         onReviewComplete();
         onClose();
         toast.success('Application approved successfully');
      } catch (error) {
         console.error('Error approving application:', error);
         toast.error(`Error approving application: ${error.message}`);
      }
   };

   const handleReturn = async () => {
      if (!remarks.trim()) {
         toast.error('Please provide remarks for returning the application.');
         return;
      }
      try {
         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }
         const result = await reviewApplication({
            variables: {
               id: application.id,
               currentStage: 'ReturnedByChief',
               status: 'Returned',
               notes: remarks,
               reviewedByChief: false,
               awaitingOOP: false
            }
         });
         console.log('Result:', result);
         onReviewComplete();
         onClose();
         toast.success('Application returned successfully');
      } catch (error) {
         console.error('Error returning application:', error);
         toast.error(`Error returning application: ${error.message}`);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle data-testid="modal-title">Review Application</DialogTitle>
               <DialogDescription>
                  Application Number: {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
               {isReturning ? (
                  <>
                     <textarea
                        data-testid="return-remarks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="Enter remarks for returning the application"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                     />
                     <Button
                        data-testid="confirm-return"
                        onClick={handleReturn}
                        className="w-full"
                     >
                        Confirm Return
                     </Button>
                     <Button
                        data-testid="cancel-return"
                        onClick={() => setIsReturning(false)}
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
                        className="w-full"
                     >
                        Approve
                     </Button>
                     <Button
                        data-testid="return-button"
                        onClick={() => setIsReturning(true)}
                        variant="outline"
                        className="w-full"
                     >
                        Return
                     </Button>
                  </>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ChiefReviewModal;
