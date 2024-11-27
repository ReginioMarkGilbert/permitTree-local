// Technical Staff Application Row

import React, { useState } from 'react';
import { Eye, ClipboardCheck, FileCheck, RotateCcw, FileCheck2, FileText } from 'lucide-react';
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
import TS_ViewModal from './TS_ViewModal';
import TS_ReviewModal from './TS_ReviewModal';
import TS_AuthenticityReviewModal from './TS_AuthenticityReviewModal';
// import GenerateCertificateModal from './GenerateCertificateModal';
import CertificateActionHandler from './CertificateActionHandler';
import { getUserRoles } from '@/utils/auth';
// import { useUndoApplicationApproval } from '@/hooks/useApplications';
import { toast } from 'sonner';
import { gql, useMutation } from '@apollo/client';
import CSAWCertificateViewModal from '../../CertificateComponents/CSAWCertificateViewModal';

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
    $PermitCreated: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      approvedByTechnicalStaff: $approvedByTechnicalStaff,
      awaitingPermitCreation: $awaitingPermitCreation,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      PermitCreated: $PermitCreated
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      awaitingPermitCreation
      approvedByTechnicalStaff
      PermitCreated
    }
  }
`;

const UNDO_ACCEPTANCE_TECHNICAL_STAFF = gql`
  mutation UndoAcceptanceTechnicalStaff($id: ID!, $acceptedByTechnicalStaff: Boolean) {
    undoAcceptanceTechnicalStaff(id: $id, acceptedByTechnicalStaff: $acceptedByTechnicalStaff) {
      id
      acceptedByTechnicalStaff
    }
  }
`;

const TS_ApplicationRow = ({ app, onReviewComplete, getStatusColor, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isAuthenticityModalOpen, setIsAuthenticityModalOpen] = useState(false);
   const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
   const [isViewCertModalOpen, setIsViewCertModalOpen] = useState(false);
   // const { handleUndoApproval, handleUndoAcceptance } = useUndoApplicationApproval();
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoAcceptanceTechnicalStaff] = useMutation(UNDO_ACCEPTANCE_TECHNICAL_STAFF);
   const handleViewClick = () => setIsViewModalOpen(true);
   const handleViewCertClick = () => setIsViewCertModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);
   const handleAuthenticityClick = () => setIsAuthenticityModalOpen(true);

   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };
   // Approved Applications tab, search handleApproveAuthenticity for reference - TS_AuthenticityReviewModal.jsx
   // Accepted Applications tab, search handleUndoAcceptance for reference - TS_ReviewModal.jsx
   const handleUndo = async () => {
      try {
         let variables;

         if (currentTab === 'Approved Applications') {
            variables = {
               id: app.id,
               currentStage: 'ForInspectionByTechnicalStaff',
               status: 'In Progress',
               notes: 'Approval undone by Technical Staff',
               approvedByTechnicalStaff: false,
               awaitingPermitCreation: false
            };
         } else if (currentTab === 'Accepted Applications') {
            try {
               const { data } = await undoAcceptanceTechnicalStaff({
                  variables: {
                     id: app.id,
                     currentStage: 'TechnicalStaffReview',
                     status: 'Submitted',
                     acceptedByTechnicalStaff: false
                  }
               });

               // Only show success if we get data back
               if (data?.undoAcceptanceTechnicalStaff) {
                  toast.success('Application status undone successfully');
                  onReviewComplete();
               } else {
                  toast.error('Failed to undo application status, already recorded by Receiving Clerk');
               }
            } catch (error) {
               console.error('Error undoing acceptance:', error);
               toast.error(error.message || 'Failed to undo application status');
            }
         } else if (currentTab === 'Created Permits') {
            variables = {
               id: app.id,
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               status: 'In Progress',
               notes: 'Permit creation undone by Technical Staff',
               PermitCreated: false,
               awaitingPermitCreation: true
            };
         }

         const { data } = await updatePermitStage({ variables });
         if (data?.updatePermitStage) {
            toast.success('Application status undone successfully');
            onReviewComplete();
         }
      } catch (error) {
         console.error('Error undoing application status:', error);
         toast.error(error.message || 'Failed to undo application status');
      }
   };

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const showGenerateCertificateButton =
      currentTab === 'Awaiting Permit Creation' &&
      app.currentStage === 'AuthenticityApprovedByTechnicalStaff' &&
      app.applicationType === 'Chainsaw Registration' &&
      !app.PermitCreated;

   const userRoles = getUserRoles();
   console.log(userRoles);
   const handleCertificateComplete = () => {
      setIsCertificateModalOpen(false);
      onReviewComplete();
   };

   const renderActionButtons = () => {
      const actions = [
         {
            icon: Eye,
            label: "View Application",
            onClick: handleViewClick,
            variant: "outline"
         },

         // Only show View Certificate button for Chainsaw Registration in Created Permits tab
         currentTab === 'Created Permits' && app.applicationType === 'Chainsaw Registration' && {
            icon: FileText,
            label: "View Certificate",
            onClick: () => setIsViewCertModalOpen(true),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
      },

         app.status === 'Submitted' && {
            icon: ClipboardCheck,
            label: "Review Application",
            onClick: handleReviewClick,
            variant: "outline",
            className: "text-blue-600 hover:text-blue-800"
         },

         currentTab === 'For Inspection and Approval' && {
            icon: FileCheck,
            label: "Approve Application Authenticity",
            onClick: handleAuthenticityClick,
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         },

         (currentTab === 'Approved Applications' ||
            currentTab === 'Accepted Applications' ||
            currentTab === 'Created Permits') && {
            icon: RotateCcw,
            label: `Undo ${currentTab === 'Accepted Applications' ? 'Acceptance' :
               currentTab === 'Created Permits' ? 'Permit Creation' :
                  'Approval'}`,
            onClick: handleUndo,
            variant: "outline",
            className: "text-yellow-600 hover:text-yellow-800"
         },

         currentTab === 'Awaiting Permit Creation' && {
            icon: FileCheck2,
            label: app.applicationType === 'Chainsaw Registration' ?
               'Generate Certificate' : 'Upload Certificate',
            onClick: () => setIsCertificateModalOpen(true),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         }
      ].filter(Boolean); // Remove falsy values

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

            {/* Add CSAWCertificateViewModal */}
            {app.applicationType === 'Chainsaw Registration' && currentTab === 'Created Permits' && (
               <CSAWCertificateViewModal
                  isOpen={isViewCertModalOpen}
                  onClose={() => setIsViewCertModalOpen(false)}
                  applicationId={app.id}
               />
            )}

            {/* Add Modals */}
            <TS_ViewModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={app}
            />
            <TS_ReviewModal
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               application={app}
               onReviewComplete={handleReviewComplete}
            />
            <TS_AuthenticityReviewModal
               isOpen={isAuthenticityModalOpen}
               onClose={() => setIsAuthenticityModalOpen(false)}
               application={app}
               onReviewComplete={handleReviewComplete}
            />
            <CertificateActionHandler
               isOpen={isCertificateModalOpen}
               onClose={() => setIsCertificateModalOpen(false)}
               application={app}
               onComplete={handleCertificateComplete}
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

         {/* Add CSAWCertificateViewModal */}
         {app.applicationType === 'Chainsaw Registration' && currentTab === 'Created Permits' && (
            <CSAWCertificateViewModal
               isOpen={isViewCertModalOpen}
               onClose={() => setIsViewCertModalOpen(false)}
               applicationId={app.id}
            />
         )}

         {/* Add Modals */}
         <TS_ViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <TS_ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
         <TS_AuthenticityReviewModal
            isOpen={isAuthenticityModalOpen}
            onClose={() => setIsAuthenticityModalOpen(false)}
            application={app}
            onReviewComplete={handleReviewComplete}
         />
         <CertificateActionHandler
            isOpen={isCertificateModalOpen}
            onClose={() => setIsCertificateModalOpen(false)}
            application={app}
            onComplete={handleCertificateComplete}
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

export default TS_ApplicationRow;
