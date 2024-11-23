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

const UNDO_OOP_CREATION = gql`
  mutation UndoOOPCreation($id: ID!) {
    undoOOPCreation(id: $id) {
      id
      awaitingOOP
      OOPCreated
    }
  }
`;

const AccountantApplicationRow = ({ app, onReviewComplete, getStatusColor }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [undoOOPCreation] = useMutation(UNDO_OOP_CREATION);

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

   const handleUndoOOP = async () => {
      try {
         await undoOOPCreation({
            variables: {
               id: app.id
            }
         });
         toast.success('OOP creation undone successfully');
         onReviewComplete(); // Refresh the list
      } catch (error) {
         console.error('Error undoing OOP creation:', error);
         toast.error('Failed to undo OOP creation');
      }
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
                  <TooltipProvider>
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

                  <TooltipProvider>
                     <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                           <Button
                              onClick={handlePrint}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              data-testid="print-button"
                           >
                              <Printer className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Print Application</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  {app.currentStage === 'ChiefRPSReview' && !app.reviewedByChief && (
                     <TooltipProvider>
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
                  )}

                  {!app.awaitingOOP && ( // if awaitingOOP is false, means OOP is created
                     <TooltipProvider>
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
                  )}
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

export default AccountantApplicationRow;
