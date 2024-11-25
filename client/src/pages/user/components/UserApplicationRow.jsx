import React, { useState } from 'react';
import { Eye, Edit, Trash2, RotateCcw, Send, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { format } from 'date-fns';

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

   const handleEditClick = () => setIsEditModalOpen(true);
   const handleViewClick = () => setIsViewModalOpen(true);
   const handleViewRemarks = () => setIsRemarksModalOpen(true);

   const handleEditSave = (editedData) => {
      onEdit(app.id, editedData);
      setIsEditModalOpen(false);
   };

   const renderActionButtons = () => {
      const actions = [
         {
            icon: Eye,
            label: "View Application",
            onClick: handleViewClick,
            variant: "outline"
         },
         // Edit action for Draft status
         app.status === 'Draft' && {
            icon: Edit,
            label: "Edit Application",
            onClick: handleEditClick,
            variant: "outline"
         },
         // Delete action for Draft status
         app.status === 'Draft' && {
            icon: Trash2,
            label: "Delete Draft",
            onClick: () => onDelete(app),
            variant: "outline",
            className: "text-red-600 hover:text-red-800"
         },
         // Submit action for Draft status
         app.status === 'Draft' && {
            icon: Send,
            label: "Submit Application",
            onClick: () => onSubmit(app),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         },
         // Actions for Returned status
         app.status === 'Returned' && {
            icon: Edit,
            label: "Edit Application",
            onClick: handleEditClick,
            variant: "outline"
         },
         app.status === 'Returned' && {
            icon: MessageSquare,
            label: "View Remarks",
            onClick: handleViewRemarks,
            variant: "outline"
         },
         app.status === 'Returned' && {
            icon: Send,
            label: "Resubmit Application",
            onClick: () => onResubmit(app),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         },
         // Unsubmit action for Submitted status
         app.status === 'Submitted' && {
            icon: RotateCcw,
            label: "Unsubmit Application",
            onClick: () => onUnsubmit(app),
            variant: "outline",
            className: "text-yellow-600 hover:text-yellow-800"
         }
      ].filter(Boolean);

      return actions.map((action, index) => (
         <TooltipProvider key={index}>
            <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                     variant={action.variant}
                     size="icon"
                     onClick={action.onClick}
                     className={action.className}
                  >
                     <action.icon className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>{action.label}</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      ));
   };

   if (isMobile) {
      return (
         <>
            <Card className="p-4 space-y-3">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="font-medium">{app.applicationNumber}</p>
                     <p className="text-sm text-muted-foreground">{app.applicationType}</p>
                  </div>
                  <Badge
                     variant={getStatusVariant(app.status).variant}
                     className={getStatusVariant(app.status).className}
                  >
                     {app.status}
                  </Badge>
               </div>
               <p className="text-sm text-muted-foreground">
                  {format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}
               </p>
               <div className="flex gap-2">
                  {renderActionButtons()}
               </div>
            </Card>

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
         <TableRow>
            <TableCell>{app.applicationNumber}</TableCell>
            <TableCell>{app.applicationType}</TableCell>
            <TableCell>{format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}</TableCell>
            <TableCell>
               <Badge
                  variant={getStatusVariant(app.status).variant}
                  className={getStatusVariant(app.status).className}
               >
                  {app.status}
               </Badge>
            </TableCell>
            <TableCell className="text-right">
               <div className="flex justify-end gap-2">
                  {renderActionButtons()}
               </div>
            </TableCell>
         </TableRow>

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

// Helper function to map status to badge variant and custom colors
const getStatusVariant = (status) => {
   switch (status.toLowerCase()) {
      case 'draft':
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
      case 'submitted':
         return {
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
         };
      case 'returned':
         return {
            variant: 'warning',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
         };
      case 'accepted':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      case 'released':
         return {
            variant: 'default',
            className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80'
         };
      case 'expired':
      case 'rejected':
         return {
            variant: 'destructive',
            className: 'bg-red-100 text-red-800 hover:bg-red-100/80'
         };
      default:
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
   }
};

export default UserApplicationRow;
