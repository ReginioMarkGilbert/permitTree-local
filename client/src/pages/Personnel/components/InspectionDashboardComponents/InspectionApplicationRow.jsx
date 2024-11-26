import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, FileCheck, Undo2 } from 'lucide-react';
import { format } from 'date-fns';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

const UNDO_INSPECTION_REPORT = gql`
   mutation UndoInspectionReport($id: ID!) {
      undoInspectionReport(id: $id) {
         id
         inspectionStatus
         findings {
            result
            observations
            recommendations
         }
         permitId
         applicationNumber
         scheduledDate
         scheduledTime
         location
      }
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

   const [undoInspectionReport] = useMutation(UNDO_INSPECTION_REPORT, {
      onCompleted: () => {
         toast.success('Inspection report has been undone');
         onRefetch?.();
      },
      onError: (error) => {
         toast.error(`Error undoing inspection report: ${error.message}`);
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

   const handleUndoReport = async () => {
      try {
         await undoInspectionReport({
            variables: {
               id: inspection.id
            }
         });
      } catch (error) {
         console.error('Error undoing inspection report:', error);
         toast.error(`Failed to undo inspection report: ${error.message}`);
      }
   };

   const renderActionButtons = () => {
      const actions = [];

      // Show Undo button if inspection exists and status is Pending
      if (inspection && inspection.inspectionStatus === 'Pending') {
         actions.push(
            <TooltipProvider key="undo-action">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleUndo}
                        variant="outline"
                        size="icon"
                        className="text-yellow-600 hover:text-yellow-800"
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

      // Only show Schedule button if there's no inspection
      if (!inspection) {
         actions.push(
            <TooltipProvider key="schedule-action">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleSchedule}
                        variant="outline"
                        size="icon"
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
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleComplete}
                        variant="outline"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800"
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

      // Add undo report button for completed inspections
      if (inspection?.inspectionStatus === 'Completed') {
         actions.push(
            <TooltipProvider key="undo-report-action">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleUndoReport}
                        variant="outline"
                        size="icon"
                        className="text-yellow-600 hover:text-yellow-800"
                     >
                        <Undo2 className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Undo Inspection Report</p>
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
            <Card className="p-4 space-y-3">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="font-medium">{application.applicationNumber}</p>
                     <p className="text-sm text-muted-foreground">{application.applicationType}</p>
                  </div>
                  <Badge
                     variant={getStatusVariant(inspection?.inspectionStatus).variant}
                     className={getStatusVariant(inspection?.inspectionStatus).className}
                  >
                     {formatInspectionStatus(inspection)}
                  </Badge>
               </div>
               <p className="text-sm text-muted-foreground">
                  {format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}
               </p>
               <div className="flex gap-2">
                  {renderActionButtons()}
               </div>
            </Card>

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
                     <label htmlFor="reason" className="text-sm font-medium">
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
         <TableRow>
            <TableCell>{application.applicationNumber}</TableCell>
            <TableCell>{application.applicationType}</TableCell>
            <TableCell>{format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}</TableCell>
            <TableCell>
               <Badge
                  variant={getStatusVariant(inspection?.inspectionStatus).variant}
                  className={getStatusVariant(inspection?.inspectionStatus).className}
               >
                  {formatInspectionStatus(inspection)}
               </Badge>
            </TableCell>
            <TableCell className="text-right">
               <div className="flex justify-end gap-2">
                  {renderActionButtons()}
               </div>
            </TableCell>
         </TableRow>

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
                  <label htmlFor="reason" className="text-sm font-medium">
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

const getStatusVariant = (status) => {
   switch (status?.toLowerCase()) {
      case 'pending':
         return {
            variant: 'warning',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
         };
      case 'completed':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      case 'cancelled':
         return {
            variant: 'destructive',
            className: 'bg-red-100 text-red-800 hover:bg-red-100/80'
         };
      default:
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
   }
};

export default InspectionApplicationRow;
