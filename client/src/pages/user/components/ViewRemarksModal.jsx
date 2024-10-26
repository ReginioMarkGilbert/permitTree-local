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

   // Debug logs
   console.log('Application in ViewRemarksModal:', application);
   console.log('History in ViewRemarksModal:', application.history);

   const latestRemarks = application.history && application.history.length > 0
      ? application.history[application.history.length - 1]
      : null;

   console.log('Latest remarks:', latestRemarks);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
   };

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
                     <Field label="Notes" value={latestRemarks.notes} />
                     <div className="mt-4">
                        <Field label="Date Returned" value={formatDate(latestRemarks.timestamp)} />
                        {/* <Field label="Stage" value={latestRemarks.stage} /> */}
                        <Field label="Status" value={latestRemarks.status} />
                     </div>
                  </>
               ) : (
                  <p className="text-sm text-gray-700">No remarks provided.</p>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
};

function Field({ label, value }) {
   return (
      <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
         <span className="text-sm text-gray-500">{label}</span>
         <p className="font-medium text-gray-800">{value}</p>
      </div>
   );
}

export default ViewRemarksModal;
