import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

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
   const [checklist, setChecklist] = useState({
      documentsVerified: false,
      physicalInspection: false,
      detailsMatch: false
   });

   const allChecked = Object.values(checklist).every(value => value === true);

   const handleApproveAuthenticity = async () => {
      try {
         if (!allChecked) {
            toast.error('Please confirm all checkboxes before approving');
            return;
         }

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
                  <div className="space-y-3">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="documentsVerified"
                           checked={checklist.documentsVerified}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, documentsVerified: checked}))
                           }
                        />
                        <label htmlFor="documentsVerified">All original documents have been verified</label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="physicalInspection"
                           checked={checklist.physicalInspection}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, physicalInspection: checked}))
                           }
                        />
                        <label htmlFor="physicalInspection">Physical inspection of the chainsaw has been completed</label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="detailsMatch"
                           checked={checklist.detailsMatch}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, detailsMatch: checked}))
                           }
                        />
                        <label htmlFor="detailsMatch">All details match the submitted application</label>
                     </div>
                  </div>
               </div>
               <div className="flex space-x-2">
                  <Button
                     onClick={onClose}
                     variant="outline"
                     className="flex-1"
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={handleApproveAuthenticity}
                     className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                     disabled={!allChecked}
                  >
                     Approve Authenticity
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default TS_AuthenticityReviewModal;
