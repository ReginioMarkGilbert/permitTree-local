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
import ChiefReviewModal from './ChiefReviewModal';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import InspectionReportReviewModal from '../../InspectionDashboardComponents/InspectionReportReviewModal';

const DELETE_OOP = gql`
  mutation DeleteOOP($applicationId: String!) {
    deleteOOP(applicationId: $applicationId) {
      _id
      applicationId
    }
  }
`;

const UNDO_OOP_CREATION = gql`
  mutation UndoOOPCreation($id: ID!) {
    undoOOPCreation(id: $id) {
      id
      awaitingOOP
      OOPCreated
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $reviewedByChief: Boolean
    $awaitingOOP: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      reviewedByChief: $reviewedByChief
      awaitingOOP: $awaitingOOP
    ) {
      id
      currentStage
      status
      reviewedByChief
      awaitingOOP
      history {
        notes
        timestamp
      }
    }
  }
`;

const ChiefApplicationRow = ({ app, onReviewComplete, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoOOPCreation] = useMutation(UNDO_OOP_CREATION);
   const [deleteOOP] = useMutation(DELETE_OOP);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);
   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };

   const handleUndoOOP = async () => {
      try {
         await deleteOOP({
            variables: {
               applicationId: app.applicationNumber
            }
         });

         await undoOOPCreation({
            variables: {
               id: app.id
            }
         });

         toast.success('OOP creation undone successfully');
         onReviewComplete();
      } catch (error) {
         console.error('Error undoing OOP creation:', error);
         toast.error('Failed to undo OOP creation');
      }
   };

   const handleUndo = async () => {
      try {
         if (currentTab === 'Completed Reviews') {
            await updatePermitStage({
               variables: {
                  id: app.id,
                  currentStage: 'ChiefRPSReview',
                  status: 'In Progress',
                  notes: 'Review undone by Chief RPS/TSD',
                  reviewedByChief: false,
                  awaitingOOP: false,
               }
            });
            toast.success('Application review undone successfully');
            onReviewComplete();
         }
      } catch (error) {
         console.error('Error undoing review:', error);
         toast.error('Failed to undo review');
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

         // app.currentStage === 'ChiefRPSReview' && !app.reviewedByChief && {
         //    icon: ClipboardCheck,
         //    label: "Review Application",
         //    onClick: handleReviewClick,
         //    variant: "outline",
         //    className: "text-blue-600 hover:text-blue-800"
         // },

         currentTab === 'Reports for Review' && {
            icon: ClipboardCheck,
            label: "View Inspection Report",
            onClick: () => setIsInspectionModalOpen(true),
            variant: "outline",
            className: "text-purple-600 hover:text-purple-800"
         },

         currentTab === 'Completed Reviews' && {
            icon: RotateCcw,
            label: "Undo Review",
            onClick: handleUndo,
            variant: "outline",
            className: "text-yellow-600 hover:text-yellow-800"
         },

         currentTab === 'Created OOP' && {
            icon: RotateCcw,
            label: "Undo OOP Creation",
            onClick: handleUndoOOP,
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
            <ChiefReviewModal
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               application={app}
               onReviewComplete={handleReviewComplete}
            />
            <InspectionReportReviewModal
               isOpen={isInspectionModalOpen}
               onClose={() => setIsInspectionModalOpen(false)}
               application={app}
            />
         </>
      );
   }

   return (
      <>
         <TableRow>
            <TableCell className="w-[25%]">
               {app.applicationNumber}
            </TableCell>
            <TableCell className="w-[25%] text-center">
               {app.applicationType}
            </TableCell>
            <TableCell className="w-[20%] text-center">
               {format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="w-[15%]">
               <div className="flex justify-center">
                  <Badge
                     variant={getStatusVariant(app.status).variant}
                     className={getStatusVariant(app.status).className}
                  >
                     {app.status}
                  </Badge>
               </div>
            </TableCell>
            <TableCell className="w-[15%]">
               <div className="flex justify-center gap-2">
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
         <ChiefReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
         <InspectionReportReviewModal
            isOpen={isInspectionModalOpen}
            onClose={() => setIsInspectionModalOpen(false)}
            application={app}
         />
      </>
   );
};

// Helper function to map status to badge variant and custom colors
const getStatusVariant = (status) => {
   switch (status.toLowerCase()) {
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
      case 'approved':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      case 'in progress':
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
      default:
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
   }
};

export default ChiefApplicationRow;
