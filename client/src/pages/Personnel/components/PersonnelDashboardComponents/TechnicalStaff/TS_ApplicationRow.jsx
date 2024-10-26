// Technical Staff Application Row

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, FileText } from 'lucide-react';
import TS_ViewModal from './TS_ViewModal';
import TS_ReviewModal from './TS_ReviewModal';

const TS_ApplicationRow = ({ app, onPrint, onReviewComplete, getStatusColor }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

   return (
      <>
         <tr key={app.id}>
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
                     onClick={() => setIsViewModalOpen(true)}
                     title="View"
                  >
                     <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                     onClick={() => onPrint(app.id)}
                     title="Print"
                  >
                     <Printer className="h-3 w-3" />
                  </Button>
                  {app.status === 'Submitted' && (
                     <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => setIsReviewModalOpen(true)}
                        title="Review"
                     >
                        <FileText className="h-3 w-3" />
                     </Button>
                  )}
               </div>
            </td>
         </tr>
         <TS_ViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <TS_ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={app}
            onReviewComplete={onReviewComplete}
         />
      </>
   );
};

export default TS_ApplicationRow;
