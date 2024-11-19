import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, ClipboardCheck, RotateCcw } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import TS_ViewModal from '../TechnicalStaff/TS_ViewModal';
import RRC_RecordModal from './RRC_RecordModal';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $recordedByReceivingClerk: Boolean,
    $acceptedByPENRCENROfficer: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      recordedByReceivingClerk: $recordedByReceivingClerk,
      acceptedByPENRCENROfficer: $acceptedByPENRCENROfficer
    ) {
      id
      currentStage
      status
      recordedByReceivingClerk
      acceptedByPENRCENROfficer
      history {
        notes
        timestamp
      }
    }
  }
`;

const UNDO_RECORD_APPLICATION = gql`
  mutation UndoRecordApplication($id: ID!, $approvedByPENRCENROfficer: Boolean) {
    undoRecordApplication(id: $id, approvedByPENRCENROfficer: $approvedByPENRCENROfficer) {
      id
      acceptedByPENRCENROfficer
      reviewedByChief
      history {
        notes
        timestamp
      }
    }
  }
`;

const RRC_ApplicationRow = ({ app, onRecordComplete, getStatusColor, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoRecordApplication] = useMutation(UNDO_RECORD_APPLICATION);
   const handleViewClick = () => setIsViewModalOpen(true);
   const handleRecordClick = () => setIsRecordModalOpen(true);

   const handleRecordComplete = () => {
      setIsRecordModalOpen(false);
      onRecordComplete();
   };

   const handleUndo = async () => {
      try {
         await undoRecordApplication({
            variables: {
               id: app.id
            }
         });

         toast.success('Application status undone successfully');
         onRecordComplete();
      } catch (error) {
         if (error.message.includes('already accepted by PENR/CENR Officer')) {
            toast.error('Cannot undo: Application already accepted by PENR/CENR Officer');
         } else if (error.message.includes('already reviewed by Chief RPS/TSD')) {
            toast.error('Cannot undo: Application already reviewed by Chief RPS/TSD');
         } else {
            toast.error('Failed to undo application status. Please try again later.');
         }
      }
   };

   const renderActions = () => {
      const actions = [];

      // View action
      actions.push(
         <TooltipProvider key="view-action">
            <Tooltip delayDuration={200}>
               <TooltipTrigger asChild>
                  <Button
                     onClick={handleViewClick}
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     data-testid="view-button"
                  >
                     <Eye className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>View Application</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      );

      // Record action - for applications that need to be recorded
      if (app.currentStage === 'ForRecordByReceivingClerk' && !app.recordedByReceivingClerk) {
         actions.push(
            <TooltipProvider key="record-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleRecordClick}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-800"
                        data-testid="record-button"
                     >
                        <ClipboardCheck className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Record Application</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }
      // Undo button
      if (currentTab === 'Reviewed/Recorded Applications') {
         actions.push(
            <TooltipProvider key="undo-action">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-yellow-600"
                        onClick={handleUndo}
                     >
                        <RotateCcw className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Undo Record</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      return actions;
   };

   if (isMobile) {
      return (
         <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <div className="flex justify-between items-start">
               <div>
                  <p className="font-medium text-gray-900">{app.applicationNumber}</p>
                  <p className="text-sm text-gray-500">{app.applicationType}</p>
               </div>
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                  {app.status}
               </span>
            </div>
            <div className="text-sm text-gray-500">
               {new Date(app.dateOfSubmission).toLocaleDateString()}
            </div>
            <div className="flex flex-wrap gap-2">
               {renderActions()}
            </div>

            <TS_ViewModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={app}
            />
            <RRC_RecordModal
               isOpen={isRecordModalOpen}
               onClose={() => setIsRecordModalOpen(false)}
               application={app}
               onRecordComplete={handleRecordComplete}
            />
         </div>
      );
   }

   return (
      <>
         <tr>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">{app.applicationNumber}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">{app.applicationType}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">
                  {new Date(app.dateOfSubmission).toLocaleDateString()}
               </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                  {app.status}
               </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
               <div className="flex items-center space-x-2">
                  {renderActions()}
               </div>
            </td>
         </tr>

         <TS_ViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <RRC_RecordModal
            isOpen={isRecordModalOpen}
            onClose={() => setIsRecordModalOpen(false)}
            application={app}
            onRecordComplete={handleRecordComplete}
         />
      </>
   );
};

export default RRC_ApplicationRow;
