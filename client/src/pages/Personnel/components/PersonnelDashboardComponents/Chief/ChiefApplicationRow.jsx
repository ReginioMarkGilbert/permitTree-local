import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, ClipboardCheck, RotateCcw } from 'lucide-react';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import TS_ViewModal from '@/pages/Personnel/components/PersonnelDashboardComponents/TechnicalStaff/TS_ViewModal';
import ChiefReviewModal from './ChiefReviewModal';
// import { useMediaQuery } from '@/hooks/useMediaQuery';

const DELETE_OOP = gql`
  mutation DeleteOOP($applicationId: String!) {
    deleteOOP(applicationId: $applicationId) {
      _id
      applicationId
    }
  }
`;

const UNDO_OOP_CREATION = gql`
  mutation UndoOOPCreation($id: ID!) {
    undoOOPCreation(id: $id) {
      id
      awaitingOOP
      OOPCreated
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $reviewedByChief: Boolean
    $awaitingOOP: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      reviewedByChief: $reviewedByChief
      awaitingOOP: $awaitingOOP
    ) {
      id
      currentStage
      status
      reviewedByChief
      awaitingOOP
      history {
        notes
        timestamp
      }
    }
  }
`;

const ChiefApplicationRow = ({ app, onReviewComplete, getStatusColor, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoOOPCreation] = useMutation(UNDO_OOP_CREATION);
   const [deleteOOP] = useMutation(DELETE_OOP);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);

   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };

   const handleUndoOOP = async () => {
      try {
         await deleteOOP({
            variables: {
               applicationId: app.applicationNumber
            }
         });

         await undoOOPCreation({
            variables: {
               id: app.id
            }
         });

         toast.success('OOP creation undone successfully');
         onReviewComplete();
      } catch (error) {
         console.error('Error undoing OOP creation:', error);
         toast.error('Failed to undo OOP creation');
      }
   };

   const handleUndo = async () => {
      try {
         if (currentTab === 'Completed Reviews') {
            await updatePermitStage({
               variables: {
                  id: app.id,
                  currentStage: 'ChiefRPSReview',
                  status: 'In Progress',
                  notes: 'Review undone by Chief RPS/TSD',
                  reviewedByChief: false,
                  awaitingOOP: false,
               }
            });
            toast.success('Application review undone successfully');
            onReviewComplete();
         }
      } catch (error) {
         console.error('Error undoing review:', error);
         toast.error('Failed to undo review');
      }
   };

   const renderActionButtons = () => {
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

      // Review action
      if (app.currentStage === 'ChiefRPSReview' && !app.reviewedByChief) {
         actions.push(
            <TooltipProvider key="review-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleReviewClick}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-800"
                        data-testid="review-button"
                     >
                        <ClipboardCheck className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Review Application</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Undo OOP action
      if (currentTab === 'Created OOP') {
         actions.push(
            <TooltipProvider key="undo-oop-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleUndoOOP}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:text-yellow-800"
                        data-testid="undo-oop-button"
                     >
                        <RotateCcw className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Undo OOP Creation</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Undo review action
      if (currentTab === 'Completed Reviews') {
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
                     <p>Undo Review</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      return actions;
   };

   if (isMobile) {
      return (
         <div className="bg-white/60 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">
                     {app.applicationNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                     {app.applicationType}
                  </p>
               </div>
               <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                  {app.status}
               </span>
            </div>

            <p className="text-sm text-gray-500">
               {new Date(app.dateOfSubmission).toLocaleDateString()}
            </p>

            <div className="flex gap-2 pt-1">
               {renderActionButtons()}
            </div>

            <TS_ViewModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={app}
            />
            <ChiefReviewModal
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               application={app}
               onReviewComplete={handleReviewComplete}
            />
         </div>
      );
   }

   return (
      <>
         <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">
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
                  {renderActionButtons()}
               </div>
            </td>
         </tr>

         <TS_ViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <ChiefReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
      </>
   );
};

export default ChiefApplicationRow;
