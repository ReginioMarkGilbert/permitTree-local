import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, CheckCircle2 } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import AccountantReviewModal from './AccountantReviewModal';

const AccountantOOPRow = ({ oop, onReviewComplete }) => {
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const handleView = () => {
      // TODO: Implement view functionality
      console.log('View OOP:', oop._id);
   };

   const handlePrint = () => {
      // TODO: Implement print functionality
      console.log('Print OOP:', oop._id);
   };

   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

   const handleApprove = () => {
      setIsReviewModalOpen(true);
   };

   return (
      <>
         <tr key={oop._id}>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.applicationId}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.billNo}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               {formatDate(oop.createdAt)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               ₱ {oop.totalAmount.toFixed(2)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  oop.OOPstatus === 'For Approval' ? 'bg-yellow-100 text-yellow-800' :
                  oop.OOPstatus === 'Approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
               }`}>
                  {oop.OOPstatus}
               </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm">
               <div className="flex items-center space-x-2">
                  <TooltipProvider>
                     <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                           <Button
                              onClick={handleView}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                           >
                              <Eye className="h-4 w-4 text-black" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>View OOP</p>
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
                           >
                              <Printer className="h-4 w-4 text-black" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Print OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  {oop.OOPstatus === 'For Approval' && (
                     <TooltipProvider>
                        <Tooltip delayDuration={200}>
                           <TooltipTrigger asChild>
                              <Button
                                 onClick={handleApprove}
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8 text-green-600 hover:text-green-800"
                              >
                                 <CheckCircle2 className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>Approve OOP</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}
               </div>
            </td>
         </tr>

         <AccountantReviewModal
            oop={oop}
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onReviewComplete={onReviewComplete}
         />
      </>
   );
};

export default AccountantOOPRow;