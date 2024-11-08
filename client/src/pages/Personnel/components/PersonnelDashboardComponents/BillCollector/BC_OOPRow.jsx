import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, FileText, RotateCcw } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import ReviewPaymentModal from './ReviewPaymentModal';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';

const UNDO_APPROVAL = gql`
   mutation UndoApproval($paymentId: ID!) {
      undoApproval(paymentId: $paymentId) {
         _id
         OOPstatus
      }
   }
`;

const BillCollectorOOPRow = ({ oop, onReviewComplete }) => {
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [undoApproval] = useMutation(UNDO_APPROVAL);
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Payment Proof Submitted':
            return 'bg-yellow-100 text-yellow-800';
         case 'Payment Proof Approved':
            return 'bg-green-100 text-green-800';
         case 'Payment Proof Rejected':
            return 'bg-red-100 text-red-800';
         case 'Awaiting Payment':
            return 'bg-blue-100 text-blue-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   const handleUndoApproval = async () => {
      try {
         await undoApproval({
            variables: {
               paymentId: oop._id
            }
         });
         toast.success('Payment approval undone successfully');
         onReviewComplete();
      } catch (error) {
         console.error('Error undoing approval:', error);
         toast.error('Failed to undo approval');
      }
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
               ₱{oop.totalAmount?.toFixed(2)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(oop.OOPstatus)}`}>
                  {oop.OOPstatus}
               </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm">
               <div className="flex items-center space-x-2">
                  <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => console.log('View OOP:', oop._id)}
                           >
                              <Eye className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>View OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  {oop.OOPstatus === 'Payment Proof Submitted' && (
                     <TooltipProvider>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={() => setIsReviewModalOpen(true)}
                              >
                                 <FileText className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>Review Payment</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}

                  <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => console.log('Print OOP:', oop._id)}
                           >
                              <Printer className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Print OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>
                  {oop.OOPstatus === 'Completed OOP' && (
                     <TooltipProvider>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={handleUndoApproval}
                              >
                                 <RotateCcw className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>Undo Approval</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}
               </div>
            </td>
         </tr>

         {isReviewModalOpen && (
            <ReviewPaymentModal
               oop={oop}
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               onReviewComplete={onReviewComplete}
            />
         )}
      </>
   );
};

export default BillCollectorOOPRow;
