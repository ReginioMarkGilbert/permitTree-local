import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, RotateCcw } from 'lucide-react';
import EditDraftModal from './EditDraftModal';
import ViewApplicationModal from './ViewApplicationModal';

const UserApplicationRow = ({
   app,
   onEdit,
   onDelete,
   onUnsubmit,
   getStatusColor,
   fetchCOVPermit,
   fetchCSAWPermit,
   fetchPLTPPermit
}) => {
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString();
   };

   const handleEditClick = () => {
      setIsEditModalOpen(true);
   };

   const handleViewClick = () => {
      setIsViewModalOpen(true);
   };

   const handleEditSave = (editedData) => {
      onEdit(app.id, editedData);
      setIsEditModalOpen(false);
   };

   return (
      <>
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
               <div className="flex items-center space-x-2">
                  <Button onClick={handleViewClick} variant="outline" size="sm">
                     <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  {app.status === 'Draft' && (
                     <>
                        <Button onClick={handleEditClick} variant="outline" size="sm">
                           <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button onClick={() => onDelete(app)} variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                           <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                     </>
                  )}
                  {app.status === 'Submitted' && (
                     <Button onClick={() => onUnsubmit(app)} variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-800">
                        <RotateCcw className="h-4 w-4 mr-1" /> Unsubmit
                     </Button>
                  )}
               </div>
            </td>
         </tr>
         <EditDraftModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditSave}
            application={app}
            fetchCOVPermit={fetchCOVPermit}
            fetchCSAWPermit={fetchCSAWPermit}
            fetchPLTPPermit={fetchPLTPPermit}
         />
         <ViewApplicationModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
      </>
   );
};

export default UserApplicationRow;
