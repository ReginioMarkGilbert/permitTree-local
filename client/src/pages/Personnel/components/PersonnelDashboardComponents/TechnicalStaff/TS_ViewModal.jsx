// Technical Staff View Modal

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const TS_ViewModal = ({ isOpen, onClose, application }) => {
   if (!application) return null;

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Application Details</DialogTitle>
               <DialogDescription>
                  Application Number: {application.applicationNumber}
               </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow">
               <div className="space-y-4 p-4">
                  <div>
                     <h3 className="font-semibold">Application Type:</h3>
                     <p>{application.applicationType}</p>
                  </div>
                  <div>
                     <h3 className="font-semibold">Status:</h3>
                     <p>{application.status}</p>
                  </div>
                  <div className="currentStage">
                     <h3 className="font-semibold">Current Stage:</h3>
                     <p>{application.currentStage}</p>
                  </div>
                  <div>
                     <h3 className="font-semibold">Date of Submission:</h3>
                     <p>{new Date(application.dateOfSubmission).toLocaleString()}</p>
                  </div>
               </div>
            </ScrollArea>
            <DialogFooter>
               <Button onClick={onClose}>Close</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default TS_ViewModal;
