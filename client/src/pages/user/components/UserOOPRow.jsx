import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger
} from "@/components/ui/tooltip";
import UserOOPviewModal from './UserOOPviewModal';
import { Printer } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { CreditCard } from "lucide-react";

const UserOOPRow = ({ oop }) => {
   const navigate = useNavigate();
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Awaiting Payment':
            return 'bg-yellow-100 text-yellow-800';
         case 'Payment Proof Submitted':
            return 'bg-blue-100 text-blue-800';
         case 'Payment Proof Rejected':
            return 'bg-red-100 text-red-800';
         case 'Payment Proof Approved':
            return 'bg-green-100 text-green-800';
         case 'Issued OR':
            return 'bg-purple-100 text-purple-800';
         case 'Completed':
            return 'bg-gray-100 text-gray-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   const handlePrint = () => {
      navigate('/user/oop-print', { state: { oop } });
   };

   const handlePayClick = () => {
      navigate(`/payment/${oop._id}`);
   };

   return (
      <>
         <tr>
            <td className="px-4 py-3 whitespace-nowrap">
               {oop.applicationId}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               {oop.billNo}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               {formatDate(oop.createdAt)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               ₱{oop.totalAmount.toFixed(2)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${getStatusColor(oop.OOPstatus)}`}>
                  {oop.OOPstatus}
               </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="flex items-center space-x-2">
                  <TooltipProvider> {/* View Button */}
                     <Tooltip delayDuration={250}>
                        <TooltipTrigger asChild>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setIsViewModalOpen(true)}
                           >
                              <Eye className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider> {/* Print Button */}
                     <Tooltip delayDuration={250}>
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
                        <TooltipContent>Print</TooltipContent>
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
               </div>
            </td>
         </tr>

         <UserOOPviewModal
            oop={oop}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
         />
      </>
   );
};

export default UserOOPRow;
