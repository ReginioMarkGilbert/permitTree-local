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

const UserApplicationRow = ({
   application,
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
}) => {
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);

   if (!application) {
      console.error('Application data is undefined');
      return null;
   }

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString();
   };

   const handleEditClick = () => setIsEditModalOpen(true);
   const handleViewClick = () => setIsViewModalOpen(true);
   const handleViewRemarks = () => setIsRemarksModalOpen(true);

   const handleEditSave = (editedData) => {
      onEdit(application.id, editedData);
      setIsEditModalOpen(false);
   };

   const {
      applicationNumber = 'N/A',
      applicationType = 'Unknown',
      dateOfSubmission,
      status = 'Unknown',
      id = 'unknown'
   } = application;

   return (
      <>
         <tr>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">{applicationNumber}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">{applicationType}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="text-sm text-gray-900">
                  {new Date(application.dateOfSubmission).toLocaleDateString()}
               </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                  {status}
               </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
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

                  {status === 'Draft' && (
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
                                    onClick={() => onDelete(application)}
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
                                    onClick={() => onSubmit(application)}
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

                  {status === 'Returned' && (
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
                                 <Button onClick={() => onResubmit(application)} variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-800">
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

                  {status === 'Submitted' && (
                     <TooltipProvider>
                        <Tooltip delayDuration={200}>
                           <TooltipTrigger asChild>
                              <Button
                                 onClick={() => onUnsubmit(application)}
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
            </td>
         </tr>

         <EditDraftModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditSave}
            application={application}
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
            application={application}
         />
         <ViewRemarksModal
            isOpen={isRemarksModalOpen}
            onClose={() => setIsRemarksModalOpen(false)}
            application={application}
         />
      </>
   );
};

export default UserApplicationRow;
