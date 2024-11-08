// Technical Staff Application Row

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, ClipboardCheck, FileCheck, RotateCcw } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import TS_ViewModal from './TS_ViewModal';
import TS_ReviewModal from './TS_ReviewModal';
import TS_AuthenticityReviewModal from './TS_AuthenticityReviewModal';
import { getUserRoles } from '../../../../../utils/auth';
import { useUndoApplicationApproval } from '../../../hooks/useApplications';
import { toast } from 'sonner';


const TS_ApplicationRow = ({ app, onPrint, onReviewComplete, getStatusColor, currentTab }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isAuthenticityModalOpen, setIsAuthenticityModalOpen] = useState(false);
   const { handleUndoApproval } = useUndoApplicationApproval();

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);
   const handleAuthenticityClick = () => setIsAuthenticityModalOpen(true);

   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };

   const userRoles = getUserRoles();
   console.log(userRoles);
   const renderActionButtons = () => {
      const actions = []; // initialize actions array
      // View action - available for all roles and stages
      actions.push(
         <TooltipProvider key="view">
            <Tooltip delayDuration={200}>
               <TooltipTrigger asChild>
                  <Button onClick={handleViewClick} variant="outline" size="icon" className="h-8 w-8">
                     <Eye className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>View Application</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      );
      // Print action - available for all roles and stages
      if (userRoles.includes('Technical_Staff') && !userRoles.includes('Receiving_Clerk')) {
         actions.push(
            <TooltipProvider key="print">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button onClick={() => onPrint(app.id)} variant="outline" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Print Application</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         )
      };
      // Review action - only when status is Submitted
      if (app.status === 'Submitted' && userRoles.includes('Technical_Staff') && !userRoles.includes('Receiving_Clerk')) {
         actions.push(
            <TooltipProvider key="review">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button onClick={handleReviewClick} variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800">
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
      // Authenticity approval action - only for For Inspection and Approval tab
      if (currentTab === 'For Inspection and Approval') {
         actions.push(
            <TooltipProvider key="authenticity">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleAuthenticityClick}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-800"
                     >
                        <FileCheck className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Approve Application Authenticity</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }
      // Add undo button only in Approved Applications tab
      if (currentTab === 'Approved Applications' && app.approvedByTechnicalStaff) {
         actions.push(
            <TooltipProvider key="undo">
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
                     <p>Undo Approval</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }
      return actions;
   };

   const handleUndo = async () => {
      try {
         await handleUndoApproval(app.id);
         toast.success('Application approval undone successfully');
         onReviewComplete();
      } catch (error) {
         toast.error('Failed to undo approval');
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
                  {renderActionButtons()}
               </div>
            </td>
         </tr>

         <TS_ViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <TS_ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
         <TS_AuthenticityReviewModal
            isOpen={isAuthenticityModalOpen}
            onClose={() => setIsAuthenticityModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
      </>
   );
};

export default TS_ApplicationRow;
