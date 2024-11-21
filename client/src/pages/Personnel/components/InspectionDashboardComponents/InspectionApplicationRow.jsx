import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, FileCheck, Undo2 } from 'lucide-react';
import { format } from 'date-fns';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TS_ScheduleInspectionModal from './TS_ScheduleInspectionModal';
import TS_InspectionReportModal from './TS_InspectionReportModal';

const DELETE_INSPECTION = gql`
   mutation DeleteInspection($id: ID!, $reason: String) {
      deleteInspection(id: $id, reason: $reason)
   }
`;

const InspectionApplicationRow = ({
   application,
   inspection,
   formatInspectionStatus,
   isScheduleDisabled,
   isMobile,
   onRefetch
}) => {
   const [showScheduleModal, setShowScheduleModal] = useState(false);
   const [showReportModal, setShowReportModal] = useState(false);
   const [showUndoDialog, setShowUndoDialog] = useState(false);
   const [cancellationReason, setCancellationReason] = useState('');

   const [deleteInspection] = useMutation(DELETE_INSPECTION, {
      onCompleted: () => {
         toast.success('Inspection schedule cancelled successfully');
         onRefetch();
      },
      onError: (error) => {
         toast.error(`Error cancelling inspection: ${error.message}`);
      }
   });

   const handleSchedule = () => {
      setShowScheduleModal(true);
   };

   const handleComplete = () => {
      setShowReportModal(true);
   };

   const handleScheduleComplete = () => {
      setShowScheduleModal(false);
      onRefetch();
   };

   const handleReportComplete = () => {
      setShowReportModal(false);
      onRefetch();
   };

   const handleUndo = () => {
      setShowUndoDialog(true);
   };

   const handleUndoConfirm = async () => {
      try {
         await deleteInspection({
            variables: {
               id: inspection.id,
               ...(cancellationReason.trim() && { reason: cancellationReason.trim() })
            }
         });
         setShowUndoDialog(false);
         setCancellationReason('');
      } catch (error) {
         console.error('Error deleting inspection:', error);
      }
   };

   const renderActionButtons = () => {
      const actions = [];

      // Show Undo button if inspection exists and status is Pending
      if (inspection && inspection.inspectionStatus === 'Pending') {
         actions.push(
            <TooltipProvider key="undo-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleUndo}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:text-yellow-800"
                     >
                        <Undo2 className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Cancel Schedule</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Only show Schedule button if there's no inspection (For Schedule tab)
      if (!inspection) {
         actions.push(
            <TooltipProvider key="schedule-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleSchedule}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                     >
                        <Calendar className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Schedule Inspection</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Complete inspection action
      if (inspection?.inspectionStatus === 'Pending') {
         actions.push(
            <TooltipProvider key="complete-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleComplete}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-800"
                     >
                        <FileCheck className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Complete Inspection</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      return actions;
   };

   if (isMobile) {
      return (
         <>
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <h3 className="font-medium text-gray-900">
                        {application.applicationNumber}
                     </h3>
                     <p className="text-sm text-gray-500">
                        {application.applicationType}
                     </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                     ${inspection?.inspectionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                     inspection?.inspectionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                     inspection?.inspectionStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                     'bg-gray-100 text-gray-800'}`}>
                     {formatInspectionStatus(inspection)}
                  </span>
               </div>

               <p className="text-sm text-gray-500">
                  {format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}
               </p>

               <div className="flex gap-2 pt-1">
                  {renderActionButtons()}
               </div>
            </div>

            {/* Modals */}
            {showScheduleModal && (
               <TS_ScheduleInspectionModal
                  isOpen={showScheduleModal}
                  onClose={() => setShowScheduleModal(false)}
                  application={application}
                  onScheduleComplete={handleScheduleComplete}
               />
            )}

            {showReportModal && (
               <TS_InspectionReportModal
                  isOpen={showReportModal}
                  onClose={() => setShowReportModal(false)}
                  inspection={inspection}
                  application={application}
                  onComplete={handleReportComplete}
               />
            )}

            <AlertDialog open={showUndoDialog} onOpenChange={(open) => {
               setShowUndoDialog(open);
               if (!open) setCancellationReason('');
            }}>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle>Cancel Inspection Schedule</AlertDialogTitle>
                     <AlertDialogDescription>
                        Are you sure you want to cancel this inspection schedule? This action cannot be undone.
                     </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="space-y-2 py-4">
                     <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                        Reason for Cancellation
                     </label>
                     <Input
                        id="reason"
                        placeholder="Enter reason for cancellation"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                     />
                  </div>

                  <AlertDialogFooter>
                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                     <AlertDialogAction onClick={handleUndoConfirm}>
                        Confirm
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </>
      );
   }

   return (
      <>
         <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-900">{application.applicationNumber}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-900">{application.applicationType}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-900">
                  {format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}
               </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${inspection?.inspectionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  inspection?.inspectionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                  inspection?.inspectionStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
                  {formatInspectionStatus(inspection)}
               </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
               <div className="flex items-center space-x-2">
                  {renderActionButtons()}
               </div>
            </td>
         </tr>

         {/* Modals */}
         {showScheduleModal && (
            <TS_ScheduleInspectionModal
               isOpen={showScheduleModal}
               onClose={() => setShowScheduleModal(false)}
               application={application}
               onScheduleComplete={handleScheduleComplete}
            />
         )}

         {showReportModal && (
            <TS_InspectionReportModal
               isOpen={showReportModal}
               onClose={() => setShowReportModal(false)}
               inspection={inspection}
               application={application}
               onComplete={handleReportComplete}
            />
         )}

         <AlertDialog open={showUndoDialog} onOpenChange={(open) => {
            setShowUndoDialog(open);
            if (!open) setCancellationReason('');
         }}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Inspection Schedule</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to cancel this inspection schedule? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>

               <div className="space-y-2 py-4">
                  <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                     Reason for Cancellation
                  </label>
                  <Input
                     id="reason"
                     placeholder="Enter reason for cancellation"
                     value={cancellationReason}
                     onChange={(e) => setCancellationReason(e.target.value)}
                  />
               </div>

               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUndoConfirm}>
                     Confirm
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
};

export default InspectionApplicationRow;
