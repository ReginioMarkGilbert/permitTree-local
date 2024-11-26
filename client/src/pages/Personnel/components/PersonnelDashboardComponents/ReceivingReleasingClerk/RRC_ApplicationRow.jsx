import React, { useState } from 'react';
import { Eye, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import TS_ViewModal from '@/pages/Personnel/components/PersonnelDashboardComponents/TechnicalStaff/TS_ViewModal';
import RRC_RecordModal from './RRC_RecordModal';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $recordedByReceivingClerk: Boolean,
    $acceptedByPENRCENROfficer: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      recordedByReceivingClerk: $recordedByReceivingClerk,
      acceptedByPENRCENROfficer: $acceptedByPENRCENROfficer
    ) {
      id
      currentStage
      status
      recordedByReceivingClerk
      acceptedByPENRCENROfficer
      history {
        notes
        timestamp
      }
    }
  }
`;

const UNDO_RECORD_APPLICATION = gql`
  mutation UndoRecordApplication($id: ID!, $approvedByPENRCENROfficer: Boolean) {
    undoRecordApplication(id: $id, approvedByPENRCENROfficer: $approvedByPENRCENROfficer) {
      id
      acceptedByPENRCENROfficer
      reviewedByChief
      history {
        notes
        timestamp
      }
    }
  }
`;

const RRC_ApplicationRow = ({ app, onRecordComplete, getStatusColor, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoRecordApplication] = useMutation(UNDO_RECORD_APPLICATION);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleRecordClick = () => setIsRecordModalOpen(true);
   const handleRecordComplete = () => {
      setIsRecordModalOpen(false);
      onRecordComplete();
   };

   const handleUndo = async () => {
      try {
         await undoRecordApplication({
            variables: {
               id: app.id
            }
         });

         toast.success('Application status undone successfully');
         onRecordComplete();
      } catch (error) {
         if (error.message.includes('already accepted by PENR/CENR Officer')) {
            toast.error('Cannot undo: Application already accepted by PENR/CENR Officer');
         } else if (error.message.includes('already reviewed by Chief RPS/TSD')) {
            toast.error('Cannot undo: Application already reviewed by Chief RPS/TSD');
         } else {
            toast.error('Failed to undo application status. Please try again later.');
         }
      }
   };

   const renderActionButtons = () => {
      const actions = [
         {
            icon: Eye,
            label: "View Application",
            onClick: handleViewClick,
            variant: "outline"
         },

         app.currentStage === 'ForRecordByReceivingClerk' && !app.recordedByReceivingClerk && {
            icon: ClipboardCheck,
            label: "Record Application",
            onClick: handleRecordClick,
            variant: "outline",
            className: "text-blue-600 hover:text-blue-800"
         },

         currentTab === 'Reviewed/Recorded Applications' && {
            icon: RotateCcw,
            label: "Undo Record",
            onClick: handleUndo,
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
            <TS_ViewModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={app}
            />
            <RRC_RecordModal
               isOpen={isRecordModalOpen}
               onClose={() => setIsRecordModalOpen(false)}
               application={app}
               onRecordComplete={handleRecordComplete}
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
         <TS_ViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <RRC_RecordModal
            isOpen={isRecordModalOpen}
            onClose={() => setIsRecordModalOpen(false)}
            application={app}
            onRecordComplete={handleRecordComplete}
         />
      </>
   );
};

// Helper function to map status to badge variant and custom colors
const getStatusVariant = (status) => {
   switch (status.toLowerCase()) {
      case 'pending':
         return {
            variant: 'warning',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
         };
      case 'recorded':
         return {
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
         };
      case 'pending release':
         return {
            variant: 'warning',
            className: 'bg-orange-100 text-orange-800 hover:bg-orange-100/80'
         };
      case 'released':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      default:
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
   }
};

export default RRC_ApplicationRow;
