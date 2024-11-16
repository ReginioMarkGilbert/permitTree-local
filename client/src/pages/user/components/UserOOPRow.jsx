import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Receipt, Printer, CreditCard, RotateCcw } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import ViewORModal from './ViewORModal';
import ViewOOPModal from './ViewOOPModal';
import ViewPaymentProofModal from './PaymentProofComponents/ViewPaymentProofModal';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';

// Add the mutation
const UNDO_PAYMENT_PROOF = gql`
  mutation UndoPaymentProof($oopId: ID!) {
    undoPaymentProof(oopId: $oopId) {
      _id
      OOPstatus
    }
  }
`;

const UserOOPRow = ({ oop, onRefetch }) => {
   const navigate = useNavigate();
   const [isViewORModalOpen, setIsViewORModalOpen] = useState(false);
   const [isViewOOPModalOpen, setIsViewOOPModalOpen] = useState(false);
   const [isViewPaymentProofModalOpen, setIsViewPaymentProofModalOpen] = useState(false);
   const [undoPaymentProof] = useMutation(UNDO_PAYMENT_PROOF);

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
         case 'Issued OR':
            return 'bg-purple-100 text-purple-800';
         case 'Completed OOP':
            return 'bg-green-100 text-green-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   const handleViewOR = () => {
      console.log('Opening OR modal for:', oop);
      console.log('Official Receipt:', oop.officialReceipt);
      setIsViewORModalOpen(true);
   };

   const handlePrint = () => {
      navigate('/user/oop-print', { state: { oop } });
   };

   const handlePayClick = () => {
      navigate(`/payment/${oop._id}`);
      if (onRefetch) {
         onRefetch();
      }
   };

   const showPaymentProof = ['Payment Proof Submitted', 'Payment Proof Approved', 'Payment Proof Rejected'].includes(oop.OOPstatus);

   const handleUndoPaymentProof = async () => {
      try {
         await undoPaymentProof({
            variables: {
               oopId: oop._id
            }
         });
         toast.success('Payment proof undone successfully');
         if (onRefetch) {
            await onRefetch();
         }
      } catch (error) {
         console.error('Error undoing payment proof:', error);
         toast.error('Failed to undo payment proof');
      }
   };

   const handlePrintOR = () => {
      if (oop.officialReceipt) {
         setIsViewORModalOpen(true); // Open the modal which has print functionality
      } else {
         toast.error('No official receipt available for printing');
      }
   };

   return (
      <>
         <tr>
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
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setIsViewOOPModalOpen(true)}
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
                              onClick={handlePrint}
                           >
                              <Printer className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Print OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  {oop.OOPstatus === 'Awaiting Payment' && (
                     <TooltipProvider>
                        <Tooltip delayDuration={250}>
                           <TooltipTrigger asChild>
                              <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={handlePayClick}
                              >
                                 <CreditCard className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>Pay</TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}

                  {oop.OOPstatus === 'Issued OR' && (
                     <>
                        <TooltipProvider>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-purple-600"
                                    onClick={handleViewOR}
                                 >
                                    <Receipt className="h-4 w-4" />
                                 </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p>View Official Receipt</p>
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
                                    onClick={handlePrintOR}
                                 >
                                    <Printer className="h-4 w-4" />
                                 </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p>Print Official Receipt</p>
                              </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                     </>
                  )}

                  {showPaymentProof && (
                     <TooltipProvider>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={() => setIsViewPaymentProofModalOpen(true)}
                              >
                                 <Receipt className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>View Payment Proof</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}

                  {oop.OOPstatus === 'Payment Proof Submitted' && (
                     <TooltipProvider>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8 text-yellow-600"
                                 onClick={handleUndoPaymentProof}
                              >
                                 <RotateCcw className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>Undo Payment Proof</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}
               </div>
            </td>
         </tr>

         {isViewORModalOpen && (
            <ViewORModal
               isOpen={isViewORModalOpen}
               onClose={() => setIsViewORModalOpen(false)}
               oop={oop}
            />
         )}

         <ViewOOPModal
            isOpen={isViewOOPModalOpen}
            onClose={() => setIsViewOOPModalOpen(false)}
            oop={oop}
         />

         <ViewPaymentProofModal
            isOpen={isViewPaymentProofModalOpen}
            onClose={() => setIsViewPaymentProofModalOpen(false)}
            paymentProof={oop.paymentProof}
         />
      </>
   );
};

export default UserOOPRow;
