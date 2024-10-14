import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, CreditCard } from 'lucide-react';

const UserOrderOfPaymentRow = React.memo(({ oop, onView, onSimulatePayment, getStatusColor }) => (
   <tr key={oop._id}>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{oop.billNo}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{oop.totalAmount}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(oop.dateCreated).toLocaleDateString()}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(oop.status)}`}>
            {oop.status}
         </span>
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
         <div className="flex flex-wrap gap-1">
            <Button
               variant="outline"
               size="icon"
               className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
               onClick={() => onView(oop.billNo)}
               title="View"
            >
               <Eye className="h-3 w-3" />
            </Button>
            {oop.status === 'Awaiting Payment' && (
               <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                  onClick={() => onSimulatePayment(oop.billNo)}
                  title="Simulate Payment"
               >
                  <CreditCard className="h-3 w-3" />
               </Button>
            )}
         </div>
      </td>
   </tr>
));

export default UserOrderOfPaymentRow;
