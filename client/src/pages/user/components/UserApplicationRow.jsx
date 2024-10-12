import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Edit, Printer, Archive, Undo, Trash2, Send, CreditCard, FileText } from 'lucide-react';

const UserApplicationRow = React.memo(({ app, onView, onEdit, onPrint, onSubmitDraft, onUnsubmit, onDelete, onViewOOP, onSimulatePayment, getStatusColor }) => (
   <tr key={app._id}>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.customId}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{app.applicationType}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(app.dateOfSubmission).toLocaleDateString()}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
            {app.status}
         </span>
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
         <div className="flex flex-wrap gap-1">
            <Button
               variant="outline"
               size="icon"
               className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
               onClick={() => onView(app._id)}
               title="View"
            >
               <Eye className="h-3 w-3" />
            </Button>

            {app.status === 'Awaiting Payment' && (
               <>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                     onClick={() => onViewOOP(app.customId)}
                     title="View OOP"
                  >
                     <FileText className="h-3 w-3" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                     onClick={() => onSimulatePayment(app)}
                     title="Simulate Payment"
                  >
                     <CreditCard className="h-3 w-3" />
                  </Button>
               </>
            )}

            {(app.status === 'Draft' || app.status === 'Returned') && (
               <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                  onClick={() => onEdit(app)}
                  title="Edit"
               >
                  <Edit className="h-3 w-3" />
               </Button>
            )}

            {app.status === 'Draft' && (
               <>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                     onClick={() => onSubmitDraft(app)}
                     title="Submit"
                  >
                     <Send className="h-3 w-3" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                     onClick={() => onDelete(app)}
                     title="Delete"
                  >
                     <Trash2 className="h-3 w-3" />
                  </Button>
               </>
            )}

            {app.status === 'Submitted' && (
               <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => onUnsubmit(app)}
                  title="Unsubmit"
               >
                  <Undo className="h-3 w-3" />
               </Button>
            )}
         </div>
      </td>
   </tr>
));

export default UserApplicationRow;
