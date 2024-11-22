import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, RotateCcw, Send, MessageSquare } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import EditDraftModal from './EditDraftModal';
import ViewApplicationModal from './ViewApplicationModal';
import ViewRemarksModal from './ViewRemarksModal';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const UserApplicationRow = ({
   app,
   onEdit,
   onDelete,
   onUnsubmit,
   onSubmit,
   onResubmit,
   getStatusColor,
   fetchCOVPermit,
   fetchCSAWPermit,
   fetchPLTCPPermit,
   fetchPTPRPermit,
   fetchPLTPPermit,
   fetchTCEBPPermit,
   currentTab
}) => {
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
   const isMobile = useMediaQuery('(max-width: 640px)');

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString();
   };

   const handleEditClick = () => setIsEditModalOpen(true);
   const handleViewClick = () => setIsViewModalOpen(true);
   const handleViewRemarks = () => setIsRemarksModalOpen(true);

   const handleEditSave = (editedData) => {
      onEdit(app.id, editedData);
      setIsEditModalOpen(false);
   };

   const renderActions = () => (
      <div className="flex items-center space-x-2">
         <TooltipProvider>
            <Tooltip delayDuration={200}>
               <TooltipTrigger asChild>
                  <Button
                     onClick={handleViewClick}
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     data-testid="view-button"
                  >
                     <Eye className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>View Application</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>

         {app.status === 'Draft' && (
            <>
               <TooltipProvider>
                  <Tooltip delayDuration={200}>
                     <TooltipTrigger asChild>
                        <Button
                           onClick={handleEditClick}
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           data-testid="edit-button"
                        >
                           <Edit className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>Edit Application</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>

               <TooltipProvider>
                  <Tooltip delayDuration={200}>
                     <TooltipTrigger asChild>
                        <Button
                           onClick={() => onDelete(app)}
                           variant="outline"
                           size="icon"
                           className="h-8 w-8 text-red-600 hover:text-red-800"
                           data-testid="delete-button"
                        >
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>Delete Draft</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>

               <TooltipProvider>
                  <Tooltip delayDuration={200}>
                     <TooltipTrigger asChild>
                        <Button
                           onClick={() => onSubmit(app)}
                           variant="outline"
                           size="icon"
                           className="h-8 w-8 text-green-600 hover:text-green-800"
                           data-testid="submit-button"
                        >
                           <Send className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>Submit Application</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            </>
         )}
         {app.status === 'Returned' && (
            <>
               <TooltipProvider>
                  <Tooltip delayDuration={200}>
                     <TooltipTrigger asChild>
                        <Button
                           onClick={handleEditClick}
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           data-testid="edit-button"
                        >
                           <Edit className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>Edit Application</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>

               <TooltipProvider>
                  <Tooltip delayDuration={200}>
                     <TooltipTrigger asChild>
                        <Button onClick={handleViewRemarks} variant="outline" size="icon" className="h-8 w-8">
                           <MessageSquare className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>View Remarks</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>

               <TooltipProvider>
                  <Tooltip delayDuration={200}>
                     <TooltipTrigger asChild>
                        <Button onClick={() => onResubmit(app)} variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-800">
                           <Send className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>Resubmit Application</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            </>
         )}
         {app.status === 'Submitted' && ( // only show unsubmit if the application is not yet in progress
            <TooltipProvider>
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={() => onUnsubmit(app)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:text-yellow-800"
                        data-testid="unsubmit-button"
                     >
                        <RotateCcw className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Unsubmit Application</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         )}
      </div>
   );

   if (isMobile) {
      return (
         <>
            <div className="bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200">
               <div className="space-y-2">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-medium text-gray-900">{app.applicationNumber}</h3>
                        <p className="text-sm text-gray-500">{app.applicationType}</p>
                     </div>
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                     </span>
                  </div>
                  <div className="text-sm text-gray-500">
                     Submitted: {new Date(app.dateOfSubmission).toLocaleDateString()}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                     {renderActions()}
                  </div>
               </div>
            </div>

            {/* Modals */}
            <EditDraftModal
               isOpen={isEditModalOpen}
               onClose={() => setIsEditModalOpen(false)}
               onSave={handleEditSave}
               application={app}
               fetchCOVPermit={fetchCOVPermit}
               fetchCSAWPermit={fetchCSAWPermit}
               fetchPLTCPPermit={fetchPLTCPPermit}
               fetchPTPRPermit={fetchPTPRPermit}
               fetchPLTPPermit={fetchPLTPPermit}
               fetchTCEBPPermit={fetchTCEBPPermit}
            />
            <ViewApplicationModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={app}
            />
            <ViewRemarksModal
               isOpen={isRemarksModalOpen}
               onClose={() => setIsRemarksModalOpen(false)}
               application={app}
            />
         </>
      );
   }

   return (
      <>
         <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">{app.applicationNumber}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">{app.applicationType}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">
                  {new Date(app.dateOfSubmission).toLocaleDateString()}
               </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                  {app.status}
               </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
               <div className="flex items-center space-x-2">
                  {renderActions()}
               </div>
            </td>
         </tr>

         {/* Modals */}
         <EditDraftModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditSave}
            application={app}
            fetchCOVPermit={fetchCOVPermit}
            fetchCSAWPermit={fetchCSAWPermit}
            fetchPLTCPPermit={fetchPLTCPPermit}
            fetchPTPRPermit={fetchPTPRPermit}
            fetchPLTPPermit={fetchPLTPPermit}
            fetchTCEBPPermit={fetchTCEBPPermit}
         />
         <ViewApplicationModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <ViewRemarksModal
            isOpen={isRemarksModalOpen}
            onClose={() => setIsRemarksModalOpen(false)}
            application={app}
         />
      </>
   );
};

export default UserApplicationRow;
