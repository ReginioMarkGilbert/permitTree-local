// Technical Staff Review Modal

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $acceptedByTechnicalStaff: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      history {
        notes
        timestamp
      }
    }
  }
`;

const TS_ReviewModal = ({ isOpen, onClose, application, onReviewComplete }) => {
   const [isReturning, setIsReturning] = useState(false);
   const [remarks, setRemarks] = useState('');
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   const handleAccept = async () => {
      try {
         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }
         const result = await updatePermitStage({
            variables: {
               id: application.id,
               currentStage: 'ForRecordByReceivingClerk',
               status: 'In Progress',
               notes: 'Application accepted by Technical Staff',
               acceptedByTechnicalStaff: true
            }
         });
         console.log('Result:', result);
         onReviewComplete();
         onClose();
         toast.success('Application accepted successfully');
      } catch (error) {
         console.error('Error accepting application:', error);
         toast.error(`Error accepting application: ${error.message}`);
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
         const result = await updatePermitStage({
            variables: {
               id: application.id,
               currentStage: 'ReturnedByTechnicalStaff',
               status: 'Returned',
               notes: remarks
               // Remove timestamp from here as it should be handled by the server
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
               <DialogTitle>Review Application</DialogTitle>
               <DialogDescription>
                  Application Number: {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
               {isReturning ? (
                  <>
                     {/* Use a regular textarea instead of the Textarea component */}
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
                        data-testid="accept-button"
                        onClick={handleAccept}
                        className="w-full"
                     >
                        Accept
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

export default TS_ReviewModal;
