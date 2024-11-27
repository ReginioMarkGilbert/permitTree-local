import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $acceptedByTechnicalStaff: Boolean,
    $approvedByTechnicalStaff: Boolean,
    $awaitingPermitCreation: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      approvedByTechnicalStaff: $approvedByTechnicalStaff,
      awaitingPermitCreation: $awaitingPermitCreation
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      approvedByTechnicalStaff
      awaitingPermitCreation
      history {
        notes
        timestamp
      }
    }
  }
`;

const TS_AuthenticityReviewModal = ({ isOpen, onClose, application, onReviewComplete }) => {
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   const handleApproveAuthenticity = async () => {
      try {
         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }
         const result = await updatePermitStage({
            variables: {
               id: application.id,
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               status: 'In Progress',
               notes: 'Application authenticity approved by Technical Staff',
               approvedByTechnicalStaff: true,
               awaitingPermitCreation: true
            }
         });
         console.log('Result:', result);
         onReviewComplete();
         onClose();
         toast.success('Application authenticity approved successfully');
      } catch (error) {
         console.error('Error approving authenticity:', error);
         toast.error(`Error approving authenticity: ${error.message}`);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Approve Application Authenticity</DialogTitle>
               <DialogDescription>
                  Application Number: {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
               <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p className="mb-2">By approving authenticity, you confirm that:</p>
                  <ul className="list-disc pl-5">
                     <li>All original documents have been verified</li>
                     <li>Physical inspection of the chainsaw has been completed</li>
                     <li>All details match the submitted application</li>
                  </ul>
               </div>
               <div className="flex space-x-2">
                  <Button
                     onClick={handleApproveAuthenticity}
                     className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                     Approve Authenticity
                  </Button>
                  <Button
                     onClick={onClose}
                     variant="outline"
                     className="flex-1"
                  >
                     Cancel
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default TS_AuthenticityReviewModal;
