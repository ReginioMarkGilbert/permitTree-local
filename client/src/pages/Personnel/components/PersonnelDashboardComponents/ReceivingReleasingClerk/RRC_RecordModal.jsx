import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const RECORD_APPLICATION = gql`
  mutation RecordApplication($id: ID!, $currentStage: String!, $status: String!) {
    recordApplication(id: $id, currentStage: $currentStage, status: $status) {
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
   const [recordApplication] = useMutation(RECORD_APPLICATION);

   const handleRecord = async () => {
      try {
         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }
         const result = await recordApplication({
            variables: {
               id: application.id,
               currentStage: 'ChiefRPSReview',
               status: 'In Progress'
            }
         });
         console.log('Result:', result);
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
