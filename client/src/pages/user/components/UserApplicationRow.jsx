import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from 'lucide-react';

const UserApplicationRow = ({ app, onView, onEdit, onDelete, getStatusColor }) => {
   // Function to format the date
   const formatDate = (timestamp) => {
      // Check if the timestamp is in milliseconds (13 digits) or seconds (10 digits)
      const date = timestamp.toString().length === 13
         ? new Date(parseInt(timestamp))
         : new Date(parseInt(timestamp) * 1000);

      return date.toLocaleDateString();
   };

   return (
      <tr>
         <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">{app.applicationNumber}</div>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">{app.applicationType}</div>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">
               {formatDate(app.dateOfSubmission)}
            </div>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
               {app.status}
            </span>
         </td>
         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
            <Button onClick={() => onView(app.id)} className="mr-2" variant="outline" size="sm">
               <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            {app.status === 'Draft' && (
               <>
                  <Button onClick={() => onEdit(app.id)} className="mr-2" variant="outline" size="sm">
                     <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button onClick={() => onDelete(app.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                     <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
               </>
            )}
         </td>
      </tr>
   );
};

export default UserApplicationRow;