import React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

const UserOOPRow = ({ oop }) => {
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   return (
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
               ${oop.OOPstatus === 'Awaiting Payment' ? 'bg-yellow-100 text-yellow-800' :
                  oop.OOPstatus === 'Payment Proof Submitted' ? 'bg-blue-100 text-blue-800' :
                     oop.OOPstatus === 'Payment Proof Rejected' ? 'bg-red-100 text-red-800' :
                        oop.OOPstatus === 'Payment Proof Approved' ? 'bg-green-100 text-green-800' :
                           oop.OOPstatus === 'Issued OR' ? 'bg-purple-100 text-purple-800' :
                              oop.OOPstatus === 'Completed OOP' ? 'bg-gray-100 text-gray-800' :
                                 'bg-gray-100 text-gray-800'}`}>
               {oop.OOPstatus}
            </span>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <Button
               variant="ghost"
               size="icon"
               className="h-8 w-8"
               onClick={() => {/* Add view action */ }}
            >
               <Eye className="h-4 w-4" />
            </Button>
         </td>
      </tr>
   );
};

export default UserOOPRow;
