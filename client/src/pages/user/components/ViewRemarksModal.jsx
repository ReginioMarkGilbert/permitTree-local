import React from 'react';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription
} from "@/components/ui/dialog";

const ViewRemarksModal = ({ isOpen, onClose, application }) => {
   if (!application) return null;

   const latestRemarks = application.history && application.history.length > 0
      ? application.history[application.history.length - 1]
      : null;

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Application Remarks</DialogTitle>
               <DialogDescription>
                  Review the remarks for this returned application.
               </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
               <h3 className="font-semibold mb-2">Remarks:</h3>
               {latestRemarks ? (
                  <>
                     <p className="text-sm text-gray-700">{latestRemarks.notes}</p>
                     <p className="text-xs text-gray-500 mt-2">
                        Date: {new Date(latestRemarks.timestamp).toLocaleString()}
                     </p>
                  </>
               ) : (
                  <p className="text-sm text-gray-700">No remarks provided.</p>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ViewRemarksModal;
