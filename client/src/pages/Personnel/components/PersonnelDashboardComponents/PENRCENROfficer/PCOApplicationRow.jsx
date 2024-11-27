// PENR_CENR_Officer Application Row
// Technical Staff Application Row

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
import PCOAppReviewModal from './PCOAppReviewModal';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';

const GET_APPLICATION_DETAILS = gql`
  query GetApplication($id: ID!) {
    getCSAWPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      registrationType
      ownerName
      address
      brand
      model
      serialNumber
      dateOfAcquisition
      powerOutput
      maxLengthGuidebar
      countryOfOrigin
      purchasePrice
      status
      currentStage
    }
    getCOVPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      name
      address
      cellphone
      purpose
      driverName
      driverLicenseNumber
      vehiclePlateNumber
      originAddress
      destinationAddress
      status
      currentStage
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $approvedByTechnicalStaff: Boolean,
    $awaitingPermitCreation: Boolean,
    $acceptedByTechnicalStaff: Boolean,
    $acceptedByPENRCENROfficer: Boolean,
    $approvedByPENRCENROfficer: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      approvedByTechnicalStaff: $approvedByTechnicalStaff,
      awaitingPermitCreation: $awaitingPermitCreation,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      acceptedByPENRCENROfficer: $acceptedByPENRCENROfficer,
      approvedByPENRCENROfficer: $approvedByPENRCENROfficer
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      awaitingPermitCreation
      approvedByTechnicalStaff
      acceptedByPENRCENROfficer
      approvedByPENRCENROfficer
    }
  }
`;

const UNDO_ACCEPTANCE_CENRPENROFFICER = gql`
  mutation UndoAcceptanceCENRPENROfficer($id: ID!, $reviewedByChief: Boolean) {
    undoAcceptanceCENRPENROfficer(id: $id, reviewedByChief: $reviewedByChief) {
      id
      reviewedByChief
      history {
        notes
        timestamp
      }
    }
  }
`;

const PCOApplicationRow = ({ app, onReviewComplete, getStatusColor, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [undoAcceptanceCENRPENROfficer] = useMutation(UNDO_ACCEPTANCE_CENRPENROFFICER);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);
   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };

   const handleUndo = async () => {
      try {
         const { data } = await undoAcceptanceCENRPENROfficer({
            variables: {
               id: app.id,
               currentStage: 'CENRPENRReview',
               status: 'In Progress',
               reviewedByChief: false
            }
         });

         // Only show success if we get data back
         if (data?.undoAcceptanceCENRPENROfficer) {
            toast.success('Application status undone successfully');
            onReviewComplete();
         } else {
            toast.error('Failed to undo application status, already reviewed by Chief RPS');
         }
      } catch (error) {
         console.error('Error undoing application status:', error);
         toast.error(error.message || 'Failed to undo application status');
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

         currentTab === 'Applications for Review' && {
            icon: ClipboardCheck,
            label: "Review Application",
            onClick: handleReviewClick,
            variant: "outline",
            className: "text-blue-600 hover:text-blue-800"
         },

         (currentTab === 'Approved Applications' || currentTab === 'Returned Applications') && {
            icon: RotateCcw,
            label: `Undo ${currentTab === 'Returned Applications' ? 'Return' : 'Approval'}`,
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
            <PCOAppReviewModal
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               application={app}
               onReviewComplete={handleReviewComplete}
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
         <PCOAppReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
      </>
   );
};

// Helper function to map status to badge variant and custom colors
const getStatusVariant = (status) => {
   switch (status.toLowerCase()) {
      case 'pending review':
         return {
            variant: 'warning',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
         };
      case 'approved':
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

export default PCOApplicationRow;
