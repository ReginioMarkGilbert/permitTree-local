import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, CheckCircle2, RotateCcw } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import ViewOOPModal from '@/pages/user/components/ViewOOPModal';
import TS_OOPReviewModal from './TS_OOPReviewModal';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { TableCell, TableRow } from "@/components/ui/table";

const UNDO_TECHNICAL_STAFF_OOP_APPROVAL = gql`
  mutation UndoTechnicalStaffOOPApproval($id: ID!) {
    undoTechnicalStaffOOPApproval(id: $id) {
      _id
      OOPstatus
    }
  }
`;

const APPROVE_OOP_TECHNICAL_STAFF = gql`
  mutation ApproveTechnicalStaffOOP($id: ID!) {
    approveTechnicalStaffOOP(id: $id) {
      _id
      OOPstatus
    }
  }
`;


const TechnicalStaffOOPRow = ({ oop, onReviewComplete, currentTab }) => {
   const navigate = useNavigate();
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [undoTechnicalStaffOOPApproval] = useMutation(UNDO_TECHNICAL_STAFF_OOP_APPROVAL);
   // const [approveTechnicalStaffOOP] = useMutation(APPROVE_OOP_TECHNICAL_STAFF);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const handleView = () => {
      setIsViewModalOpen(true);
   };

   const handlePrint = () => {
      navigate('/user/oop-print', { state: { oop } });
   };

   const handleApprove = () => {
      setIsReviewModalOpen(true);
   };

   const handleUndo = async () => {
      try {
         await undoTechnicalStaffOOPApproval({
            variables: {
               id: oop._id
            }
         });
         toast.success('OOP approval undone successfully');
         if (onReviewComplete) onReviewComplete();
      } catch (error) {
         console.error('Error undoing approval:', error);
         toast.error('Failed to undo approval');
      }
   };

   return (
      <>
         <TableRow>
            <TableCell className="w-[25%]">{oop.applicationNumber}</TableCell>
            <TableCell className="w-[15%] text-center">{oop.billNo}</TableCell>
            <TableCell className="w-[15%] text-center">{formatDate(oop.createdAt)}</TableCell>
            <TableCell className="w-[15%] text-center">₱ {oop.totalAmount.toFixed(2)}</TableCell>
            <TableCell className="w-[15%]">
               <div className="flex justify-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${oop.OOPstatus === 'For Approval' ? 'bg-yellow-100 text-yellow-800' :
                     oop.OOPstatus === 'Awaiting Payment' ? 'bg-green-100 text-green-800' :
                        oop.OOPstatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                           'bg-gray-100 text-gray-800'
                     }`}>
                     {oop.OOPstatus}
                  </span>
               </div>
            </TableCell>
            <TableCell className="w-[15%]">
               <div className="flex justify-center gap-2">
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

                  {currentTab === 'Approved OOP' && oop.OOPstatus === 'Awaiting Payment' && (
                     <TooltipProvider>
                        <Tooltip delayDuration={200}>
                           <TooltipTrigger asChild>
                              <Button
                                 onClick={handleUndo}
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8 text-yellow-600 hover:text-yellow-800"
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
            </TableCell>
         </TableRow>

         <ViewOOPModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            oop={oop}
         />

         <TS_OOPReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            oop={oop}
            onReviewComplete={onReviewComplete}
         />
      </>
   );
};

export default TechnicalStaffOOPRow;
