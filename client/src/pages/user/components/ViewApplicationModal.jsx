import React from 'react';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";

const ViewApplicationModal = ({ isOpen, onClose, application }) => {
   if (!application) return null;

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Application Details</DialogTitle>
               <DialogDescription>
                  View the details of the application.
               </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Application Number:</label>
                  <span className="col-span-3">{application.applicationNumber}</span>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Type:</label>
                  <span className="col-span-3">{application.applicationType}</span>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Status:</label>
                  <span className="col-span-3">{application.status}</span>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Submission Date:</label>
                  <span className="col-span-3">{formatDate(application.dateOfSubmission)}</span>
               </div>
               {/* Add more fields based on the application type */}
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ViewApplicationModal;
