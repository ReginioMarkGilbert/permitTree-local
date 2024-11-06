import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Eye, Printer, PenLine } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger
} from "@/components/ui/tooltip";
import UserOOPviewModal from './UserOOPviewModal';

const UserOOPRow = ({ oop }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'awaiting payment': return 'bg-yellow-100 text-yellow-800';
         case 'payment proof submitted': return 'bg-blue-100 text-blue-800';
         case 'payment proof rejected': return 'bg-red-100 text-red-800';
         case 'payment proof approved': return 'bg-green-100 text-green-800';
         case 'issued or': return 'bg-purple-100 text-purple-800';
         case 'completed oop': return 'bg-gray-100 text-gray-800';
         default: return 'bg-gray-100 text-gray-800';
      }
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
               <TooltipProvider>
                  <Tooltip>
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
