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
    $notes: String
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes
    ) {
      id
      currentStage
      status
      history {
        notes
        timestamp
      }
    }
  }
`;

const ReleaseConfirmationModal = ({ isOpen, onClose, application, onComplete }) => {
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [checklist, setChecklist] = useState({
      stampedCertificateVerified: false,
      signatureVerified: false,
      applicantIdentityVerified: false,
      paymentVerified: false
   });

   const allChecked = Object.values(checklist).every(value => value === true);

   const handleRelease = async () => {
      try {
         if (!allChecked) {
            toast.error('Please confirm all checkboxes before releasing');
            return;
         }

         if (!application || !application.id) {
            throw new Error('Invalid application data');
         }

         const result = await updatePermitStage({
            variables: {
               id: application.id,
               currentStage: 'Released',
               status: 'Released',
               notes: 'Certificate released to applicant'
            }
         });

         console.log('Release result:', result);
         onComplete();
         onClose();
         toast.success('Certificate released successfully');
      } catch (error) {
         console.error('Error releasing certificate:', error);
         toast.error(`Error releasing certificate: ${error.message}`);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Release Certificate Confirmation</DialogTitle>
               <DialogDescription>
                  Application Number: {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
               <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p className="mb-2">Before releasing the certificate, please confirm that:</p>
                  <div className="space-y-3">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="stampedCertificateVerified"
                           checked={checklist.stampedCertificateVerified}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, stampedCertificateVerified: checked}))
                           }
                        />
                        <label htmlFor="stampedCertificateVerified">
                           Physical certificate has been stamped and verified
                        </label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="signatureVerified"
                           checked={checklist.signatureVerified}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, signatureVerified: checked}))
                           }
                        />
                        <label htmlFor="signatureVerified">
                           PENR/CENR Officer signature is present and verified
                        </label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="applicantIdentityVerified"
                           checked={checklist.applicantIdentityVerified}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, applicantIdentityVerified: checked}))
                           }
                        />
                        <label htmlFor="applicantIdentityVerified">
                           Applicant's identity has been verified
                        </label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="paymentVerified"
                           checked={checklist.paymentVerified}
                           onCheckedChange={(checked) =>
                              setChecklist(prev => ({...prev, paymentVerified: checked}))
                           }
                        />
                        <label htmlFor="paymentVerified">
                           All payments have been verified
                        </label>
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
                     onClick={handleRelease}
                     className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                     disabled={!allChecked}
                  >
                     Release Certificate
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ReleaseConfirmationModal;
