import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Receipt, Printer } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import ViewORModal from './ViewORModal';
import ViewOOPModal from './ViewOOPModal';
import { useNavigate } from 'react-router-dom';

const UserOOPRow = ({ oop }) => {
   const navigate = useNavigate();
   const [isViewORModalOpen, setIsViewORModalOpen] = useState(false);
   const [isViewOOPModalOpen, setIsViewOOPModalOpen] = useState(false);

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

   return (
      <>
         <tr>
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

                  {oop.OOPstatus === 'Issued OR' && (
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
      </>
   );
};

export default UserOOPRow;
