// PENR_CENR_Officer Application Row
// Technical Staff Application Row

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, ClipboardCheck, FileCheck, RotateCcw, FileText, CheckCircle, XCircle, FileCheck2 } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import TS_ViewModal from '@/pages/Personnel/components/PersonnelDashboardComponents/TechnicalStaff/TS_ViewModal';
import PCOAppReviewModal from './PCOAppReviewModal';
// import GenerateCertificateModal from './GenerateCertificateModal';
// import CertificateActionHandler from './CertificateActionHandler';
import { getUserRoles } from '@/utils/auth';
// import { useUndoApplicationApproval } from '../../../hooks/useApplications';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { gql, useMutation } from '@apollo/client';

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
   // const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoAcceptanceCENRPENROfficer] = useMutation(UNDO_ACCEPTANCE_CENRPENROFFICER);

   const handleViewClick = () => setIsViewModalOpen(true);
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

         await undoAcceptanceCENRPENROfficer({
            variables: {
               id: app.id
            }
         });

         toast.success('Application status undone successfully');
         onReviewComplete();
      } catch (error) {
         console.error('Error undoing application status:', error);
         toast.error(error.message);
      }
   };

   // correct way to format date in application row
   const formatDate = (timestamp) => {
      // const date = new Date(timestamp);
      // return date.toLocaleDateString();
      return new Date(timestamp).toLocaleDateString();
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
      const actions = [];

      // View action
      actions.push(
         <TooltipProvider key="view-action">
            <Tooltip delayDuration={200}>
               <TooltipTrigger asChild>
                  <Button onClick={handleViewClick} variant="outline" size="icon" className="h-8 w-8">
                     <Eye className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>View Application</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      );

      // Add other action buttons based on currentTab
      if (currentTab === 'Pending Reviews') {
         actions.push(
            <TooltipProvider key="review-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button onClick={handleReviewClick} variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800">
                        <ClipboardCheck className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Review Application</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Add undo button for specific tabs
      if (currentTab === 'Approved Applications' || currentTab === 'Returned Applications') {
         actions.push(
            <TooltipProvider key="undo-action">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-yellow-600"
                        onClick={handleUndo}
                     >
                        <RotateCcw className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Undo {currentTab === 'Returned Applications' ? 'Return' : 'Approval'}</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      return actions;
   };

   if (isMobile) {
      return (
         <div className="bg-white/60 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">
                     {app.applicationNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                     {app.applicationType}
                  </p>
               </div>
               <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                  {app.status}
               </span>
            </div>

            <p className="text-sm text-gray-500">
               {new Date(app.dateOfSubmission).toLocaleDateString()}
            </p>

            <div className="flex gap-2 pt-1">
               {renderActionButtons()}
            </div>

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
         </div>
      );
   }

   return (
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
               {renderActionButtons()}
            </div>
         </td>
      </tr>
   );
};

export default PCOApplicationRow;
