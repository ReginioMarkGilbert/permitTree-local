import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, FileText, X } from 'lucide-react';

const ApplicationRow = React.memo(({ app, onView, onPrint, onReview, onOrderOfPayment, onUndoStatus, getStatusColor }) => (
   <tr key={app._id}>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicationNumber}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicationType}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.dateOfSubmission).toLocaleDateString()}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
            {app.status}
         </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
         <div className="flex flex-wrap gap-1">
            <Button
               variant="outline"
               size="icon"
               className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
               onClick={() => onView(app._id, app.status)}
               title="View"
            >
               <Eye className="h-3 w-3" />
            </Button>
            <Button
               variant="outline"
               size="icon"
               className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
               onClick={() => onPrint(app._id)}
               title="Print"
            >
               <Printer className="h-3 w-3" />
            </Button>
            {app.status === 'For Review' && (
               <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                  onClick={() => onReview(app._id)}
                  title="Review"
               >
                  <FileText className="h-3 w-3" />
               </Button>
            )}
            {app.status === 'Accepted' && (
               <>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                     onClick={() => onOrderOfPayment(app)}
                     title="Create Order of Payment"
                  >
                     <FileText className="h-3 w-3" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                     onClick={() => onUndoStatus(app._id)}
                     title="Undo Status"
                  >
                     <X className="h-3 w-3" />
                  </Button>
               </>
            )}
         </div>
      </td>
   </tr>
));


export default ApplicationRow;
