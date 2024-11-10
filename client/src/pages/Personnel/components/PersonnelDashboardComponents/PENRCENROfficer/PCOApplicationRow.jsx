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
import TS_ViewModal from '../TechnicalStaff/TS_ViewModal';
import PCOAppReviewModal from './PCOAppReviewModal';
// import GenerateCertificateModal from './GenerateCertificateModal';
// import CertificateActionHandler from './CertificateActionHandler';
import { getUserRoles } from '../../../../../utils/auth';
import { useUndoApplicationApproval } from '../../../hooks/useApplications';
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
    $acceptedByTechnicalStaff: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      approvedByTechnicalStaff: $approvedByTechnicalStaff,
      awaitingPermitCreation: $awaitingPermitCreation,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      awaitingPermitCreation
      approvedByTechnicalStaff
    }
  }
`;

const PCOApplicationRow = ({ app, onPrint, onReviewComplete, getStatusColor, currentTab }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   // const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
   // const { handleUndoApproval, handleUndoAcceptance } = useUndoApplicationApproval();
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

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
         let variables;

         if (currentTab === 'Accepted Applications') {
            variables = {
               id: app.id,
               currentStage: 'CENRPENRReview',
               status: 'In Progress',
               notes: 'Acceptance undone by PENR/CENR Officer',
               acceptedByPENRCENROfficer: false,
               approvedByPENRCENROfficer: false
            };
         }
         // } else if (currentTab === 'Approved Applications') {
         //    // Existing undo logic for approved applications
         //    variables = {
         //       id: app.id,
         //       currentStage: 'TechnicalStaffReview',
         //       status: 'Submitted',
         //       notes: 'Approval undone by PENR/CENR Officer',
         //       approvedByPENRCENROfficer: false
         //    };
         // }

         await updatePermitStage({ variables });
         toast.success('Application status undone successfully');
         onReviewComplete();
      } catch (error) {
         console.error('Error undoing application status:', error);
         toast.error('Failed to undo application status');
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

      // Print action
      if (userRoles.includes('PENR_CENR_Officer')) {
         actions.push(
            <TooltipProvider key="print-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button onClick={() => onPrint(app.id)} variant="outline" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Print Application</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Review action
      if ((currentTab === 'Applications for Review' || app.currentStage === 'CENRPENRReview') && userRoles.includes('PENR_CENR_Officer')) {
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

      // Undo button
      if (currentTab === 'Accepted Applications') {
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
                     <p>Undo {currentTab === 'Accepted Applications' ? 'Acceptance' : 'Approval'}</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      // Certificate generation/upload button
      // if ((currentTab === 'Awaiting Permit Creation') && app.awaitingPermitCreation) {
      //    actions.push(
      //       <TooltipProvider key="generate-certificate-action">
      //          <Tooltip>
      //             <TooltipTrigger asChild>
      //                <Button
      //                   variant="outline"
      //                   size="icon"
      //                   className="h-8 w-8 text-green-600"
      //                   onClick={() => setIsCertificateModalOpen(true)}
      //                >
      //                   <FileCheck2 className="h-4 w-4" />
      //                </Button>
      //             </TooltipTrigger>
      //             <TooltipContent>
      //                <p>{app.applicationType === 'Chainsaw Registration' ? 'Generate Certificate' : 'Upload Certificate'}</p>
      //             </TooltipContent>
      //          </Tooltip>
      //       </TooltipProvider>
      //    );
      // }

      return actions;
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
                  {renderActionButtons()}
               </div>
            </td>
         </tr>

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
         {/* <CertificateActionHandler
            isOpen={isCertificateModalOpen}
            onClose={() => setIsCertificateModalOpen(false)}
            application={app}
            onComplete={handleCertificateComplete}
         /> */}
      </>
   );
};

export default PCOApplicationRow;
