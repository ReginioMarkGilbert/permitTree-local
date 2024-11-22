import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, FileText, RotateCcw, Receipt } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import ReviewPaymentModal from './ReviewPaymentModal';
import GenerateORModal from './GenerateORModal';
import ViewOOPModal from '@/pages/user/components/ViewOOPModal';
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

// Add query for OOP details with payment proof
const GET_OOP_DETAILS = gql`
  query GetOOPDetails($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      namePayee
      address
      natureOfApplication
      totalAmount
      OOPstatus
      createdAt
      items {
        legalBasis
        description
        amount
      }
      paymentProof {
        transactionId
        paymentMethod
        amount
        timestamp
        referenceNumber
        payerDetails {
          name
          email
          phoneNumber
        }
        status
      }
    }
  }
`;

const BillCollectorOOPRow = ({ oop, onReviewComplete, isMobile }) => {
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isGenerateORModalOpen, setIsGenerateORModalOpen] = useState(false);
   const [isViewOOPModalOpen, setIsViewOOPModalOpen] = useState(false);
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
   // undo payment approval
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

   const handleViewOOP = () => {
      setIsViewOOPModalOpen(true);
   };

   useEffect(() => {
      console.log('OOP data in BC_OOPRow:', oop);
      console.log('Payment Proof:', oop?.paymentProof);
   }, [oop]);

   const handleReviewClick = () => {
      console.log('Opening review modal for OOP:', oop);
      console.log('Payment proof data:', oop.paymentProof);
      setIsReviewModalOpen(true);
   };

   if (isMobile) {
      return (
         <div className="bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-3">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <h3 className="font-medium text-gray-900">
                        {oop.applicationNumber}
                     </h3>
                     <p className="text-sm text-gray-500">
                        Bill No: {oop.billNo}
                     </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(oop.OOPstatus)}`}>
                     {oop.OOPstatus}
                  </span>
               </div>

               <div className="flex flex-col space-y-1">
                  <div className="text-sm text-gray-500">
                     Date: {formatDate(oop.createdAt)}
                  </div>
                  <div className="text-sm font-medium">
                     Amount: ₱{oop.totalAmount?.toFixed(2)}
                  </div>
               </div>

               <div className="pt-3 flex flex-wrap gap-2">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handleViewOOP}
                  >
                     <Eye className="h-4 w-4 mr-1" />
                     View
                  </Button>

                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => console.log('Print OOP:', oop._id)}
                  >
                     <Printer className="h-4 w-4 mr-1" />
                     Print OOP
                  </Button>

                  {oop.OOPstatus === 'Payment Proof Submitted' && (
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReviewClick}
                     >
                        <FileText className="h-4 w-4 mr-1" />
                        Review Payment
                     </Button>
                  )}

                  {oop.OOPstatus === 'Completed OOP' && (
                     <>
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setIsGenerateORModalOpen(true)}
                        >
                           <Receipt className="h-4 w-4 mr-1" />
                           Generate OR
                        </Button>

                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handleUndoApproval}
                        >
                           <RotateCcw className="h-4 w-4 mr-1" />
                           Undo Approval
                        </Button>
                     </>
                  )}
               </div>
            </div>
         </div>
      );
   }

   return (
      <>
         <tr key={oop._id}>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.applicationNumber}
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
                     <Tooltip delayDuration={250}>
                        <TooltipTrigger asChild>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleViewOOP}
                           >
                              <Eye className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>View OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

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

                  {oop.OOPstatus === 'Payment Proof Submitted' && (
                     <TooltipProvider>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8 text-green-500"
                                 onClick={handleReviewClick}
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

                  {oop.OOPstatus === 'Completed OOP' && (
                     <>
                        <TooltipProvider>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => setIsGenerateORModalOpen(true)}
                                 >
                                    <Receipt className="h-4 w-4" />
                                 </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p>Generate OR</p>
                              </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-600"
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
                     </>
                  )}
               </div>
            </td>
         </tr>

         <ViewOOPModal
            isOpen={isViewOOPModalOpen}
            onClose={() => setIsViewOOPModalOpen(false)}
            oop={oop}
         />

         {isReviewModalOpen && (
            <ReviewPaymentModal
               oop={oop}
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               onReviewComplete={onReviewComplete}
            />
         )}

         {isGenerateORModalOpen && (
            <GenerateORModal
               oop={oop}
               isOpen={isGenerateORModalOpen}
               onClose={() => setIsGenerateORModalOpen(false)}
               onComplete={onReviewComplete}
            />
         )}
      </>
   );
};

export default BillCollectorOOPRow;
