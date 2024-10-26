// Technical Staff Review Modal

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage($id: ID!, $currentStage: String!, $status: String!, $notes: String) {
    updatePermitStage(id: $id, currentStage: $currentStage, status: $status, notes: $notes) {
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
               timestamp: new Date().toISOString()
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
               notes: remarks,
               timestamp: new Date().toISOString()
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
                     <Textarea
                        placeholder="Enter remarks for returning the application"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                     />
                     <Button onClick={handleReturn} className="w-full">Confirm Return</Button>
                     <Button onClick={() => setIsReturning(false)} variant="outline" className="w-full">Cancel</Button>
                  </>
               ) : (
                  <>
                     <Button onClick={handleAccept} className="w-full">Accept</Button>
                     <Button onClick={() => setIsReturning(true)} variant="outline" className="w-full">Return</Button>
                  </>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default TS_ReviewModal;
