// Technical Staff Application Row

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, ClipboardCheck } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import TS_ViewModal from './TS_ViewModal';
import TS_ReviewModal from './TS_ReviewModal';

const TS_ApplicationRow = ({ app, onPrint, onReviewComplete, getStatusColor }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);

   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
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
                           <Button onClick={handleViewClick} variant="outline" size="icon" className="h-8 w-8">
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
                           <Button onClick={() => onPrint(app.id)} variant="outline" size="icon" className="h-8 w-8">
                              <Printer className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Print Application</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  {app.status === 'Submitted' && (
                     <TooltipProvider>
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
                  )}
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
      </>
   );
};

export default TS_ApplicationRow;
