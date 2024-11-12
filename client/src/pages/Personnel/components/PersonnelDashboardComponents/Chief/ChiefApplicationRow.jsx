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
import TS_ViewModal from '../TechnicalStaff/TS_ViewModal';
import ChiefReviewModal from './ChiefReviewModal';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $reviewedByChief: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      reviewedByChief: $reviewedByChief
    ) {
      id
      currentStage
      status
      reviewedByChief
      history {
        notes
        timestamp
      }
    }
  }
`;

const ChiefApplicationRow = ({ app, onReviewComplete, getStatusColor, currentTab }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);

   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };

   const handlePrint = () => {
      // Implement print functionality
      console.log('Print application:', app.id);
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
                  reviewedByChief: false
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

      // Undo action for completed reviews
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
