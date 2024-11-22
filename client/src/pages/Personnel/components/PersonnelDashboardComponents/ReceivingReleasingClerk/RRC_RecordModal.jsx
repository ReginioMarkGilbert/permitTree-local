import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $recordedByReceivingClerk: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      recordedByReceivingClerk: $recordedByReceivingClerk
    ) {
      id
      currentStage
      status
      recordedByReceivingClerk
      history {
        notes
        timestamp
      }
    }
  }
`;

const RRC_RecordModal = ({ isOpen, onClose, application, onRecordComplete }) => {
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   const handleRecord = async () => {
      try {
         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }

         const nextStage = application.applicationType === 'Chainsaw Registration'
            ? 'ChiefRPSReview'
            : 'CENRPENRReview';

         const result = await updatePermitStage({
            variables: {
               id: application.id,
               currentStage: nextStage,
               status: 'In Progress',
               notes: `Application recorded by receiving clerk and forwarded to ${nextStage}`,
               recordedByReceivingClerk: true
            }
         });

         onRecordComplete();
         onClose();
         toast.success('Application recorded successfully');
      } catch (error) {
         console.error('Error recording application:', error);
         toast.error(`Error recording application: ${error.message}`);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle data-testid="modal-title">Record Application</DialogTitle>
               <DialogDescription>
                  Application Number: {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
               <p className="text-sm text-gray-600">
                  Are you sure you want to record this application?
                  This action will mark the application as recorded in the system.
               </p>
               <div className="flex space-x-2">
                  <Button
                     onClick={handleRecord}
                     className="flex-1"
                     data-testid="record-button"
                  >
                     Record Application
                  </Button>
                  <Button
                     onClick={onClose}
                     variant="outline"
                     className="flex-1"
                     data-testid="cancel-button"
                  >
                     Cancel
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default RRC_RecordModal;
