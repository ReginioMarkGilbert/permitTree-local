// Technical Staff Application Row

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { ClipboardCheck, Download, Eye, FileCheck, FileCheck2, RotateCcw, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TS_AuthenticityReviewModal from './TS_AuthenticityReviewModal';
import TS_ReviewModal from './TS_ReviewModal';
import TS_ViewModal from './TS_ViewModal';
// import GenerateCertificateModal from './GenerateCertificateModal';
import { getUserRoles } from '@/utils/auth';
import CertificateActionHandler from './CertificateActionHandler';
// import { useUndoApplicationApproval } from '@/hooks/useApplications';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { gql, useMutation, useQuery } from '@apollo/client';
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import CertificateViewModal from './CertificateViewModal';
import TS_InspectionReportModal from '../../InspectionDashboardComponents/TS_InspectionReportModal';
import TS_InspectionReportsViewModal from './TS_InspectionReportsViewModal';
import UploadStampedCertificateModal from './UploadStampedCertificateModal';
import ReleaseConfirmationModal from './ReleaseConfirmationModal';

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
    $PermitCreated: Boolean,
    $hasCertificate: Boolean,
    $certificateId: ID
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      approvedByTechnicalStaff: $approvedByTechnicalStaff,
      awaitingPermitCreation: $awaitingPermitCreation,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      PermitCreated: $PermitCreated,
      hasCertificate: $hasCertificate,
      certificateId: $certificateId
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      awaitingPermitCreation
      approvedByTechnicalStaff
      PermitCreated
      hasCertificate
      certificateId
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

const GET_CERTIFICATE = gql`
  query GetCertificatesByApplicationId($applicationId: ID!) {
    getCertificatesByApplicationId(applicationId: $applicationId) {
      id
      certificateNumber
      certificateStatus
      dateCreated
      dateIssued
      expiryDate
      uploadedCertificate {
        filename
        contentType
        fileData
        uploadDate
        metadata {
          certificateType
          issueDate
          expiryDate
          remarks
        }
      }
    }
  }
`;

const UPDATE_CERTIFICATE = gql`
  mutation UpdateCertificate($id: ID!, $certificateStatus: String) {
    updateCertificate(id: $id, certificateStatus: $certificateStatus) {
      id
      certificateStatus
    }
  }
`;

const TS_ApplicationRow = ({ app, onReviewComplete, getStatusColor, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isAuthenticityModalOpen, setIsAuthenticityModalOpen] = useState(false);
   const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
   const [isViewCertModalOpen, setIsViewCertModalOpen] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);
   // const { handleUndoApproval, handleUndoAcceptance } = useUndoApplicationApproval();
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [undoAcceptanceTechnicalStaff] = useMutation(UNDO_ACCEPTANCE_TECHNICAL_STAFF);
   const [updateCertificate] = useMutation(UPDATE_CERTIFICATE);
   const handleViewClick = () => setIsViewModalOpen(true);
   const handleViewCertClick = () => setIsViewCertModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);
   const handleAuthenticityClick = () => setIsAuthenticityModalOpen(true);
   const [isInspectionReportsModalOpen, setIsInspectionReportsModalOpen] = useState(false);
   const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

   const { loading: certLoading, error: certError, data: certData } = useQuery(GET_CERTIFICATE, {
      variables: { applicationId: app.id },
      skip: !isViewCertModalOpen
   });

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
               awaitingPermitCreation: true,
               hasCertificate: false,
               certificateId: null,
               certificateSignedByPENRCENROfficer: false
            };
         }

         if (variables) {
            const { data } = await updatePermitStage({ variables });
            if (data?.updatePermitStage) {
               toast.success('Application status undone successfully');
               onReviewComplete();
            }
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

   const handlePreview = (fileData, contentType) => {
      try {
         const byteCharacters = atob(fileData);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const file = new Blob([byteArray], { type: contentType });
         const fileUrl = URL.createObjectURL(file);
         setPreviewUrl(fileUrl);
         setSelectedFile(file);
      } catch (error) {
         console.error('Error previewing file:', error);
         toast.error('Error previewing file');
      }
   };

   const handleDownload = (fileData, filename, contentType) => {
      try {
         const byteCharacters = atob(fileData);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const file = new Blob([byteArray], { type: contentType });
         const link = document.createElement('a');
         link.href = URL.createObjectURL(file);
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      } catch (error) {
         console.error('Error downloading file:', error);
         toast.error('Error downloading file');
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

         (currentTab === 'Created Permits' || currentTab === 'Pending Release' || currentTab === 'Released Certificates') && {
            icon: FileText,
            label: "View Certificate",
            onClick: handleViewCertClick,
            variant: "outline",
            className: "text-purple-600 hover:text-purple-800"
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
            label: 'Upload Certificate',
            onClick: () => setIsCertificateModalOpen(true),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         },

         currentTab === 'Approved Applications' && {
            icon: FileCheck2,
            label: "View Inspection Reports",
            onClick: () => setIsInspectionReportsModalOpen(true),
            variant: "outline",
            className: "text-purple-600 hover:text-purple-800"
         },

         currentTab === 'Pending Release' && {
            icon: FileCheck2,
            label: 'Upload Stamped Certificate',
            onClick: () => setIsCertificateModalOpen(true),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         },

         currentTab === 'Pending Release' && {
            icon: FileCheck2,
            label: 'Release Certificate',
            onClick: () => setIsReleaseModalOpen(true),
            variant: "outline",
            className: "text-blue-600 hover:text-blue-800"
         },

         currentTab === 'Released Certificates' && {
            icon: RotateCcw,
            label: "Undo Release",
            onClick: handleUndoRelease,
            variant: "outline",
            className: "text-yellow-600 hover:text-yellow-800"
         },
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

   useEffect(() => {
      return () => {
         if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
         }
      };
   }, [previewUrl]);

   useEffect(() => {
      if (certError) {
         console.error('Error fetching certificate:', certError);
         toast.error('Error loading certificate');
      }
   }, [certError]);

   const handleUndoRelease = async () => {
      try {
         const result = await updatePermitStage({
            variables: {
               id: app.id,
               currentStage: 'PendingRelease',
               status: 'In Progress',
               notes: 'Release undone by Technical Staff'
            }
         });

         // Also update certificate status
         if (certData?.getCertificatesByApplicationId[0]?.id) {
            await updateCertificate({
               variables: {
                  id: certData.getCertificatesByApplicationId[0].id,
                  certificateStatus: 'Stamped Certificate'
               }
            });
         }

         if (result?.data?.updatePermitStage) {
            toast.success('Certificate release undone successfully');
            onReviewComplete();
         }
      } catch (error) {
         console.error('Error undoing release:', error);
         toast.error(`Failed to undo release: ${error.message}`);
      }
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
            <UploadStampedCertificateModal
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
            <TableCell className="w-[25%]">{app.applicationNumber}</TableCell>
            <TableCell className="w-[25%] text-center">{app.applicationType}</TableCell>
            <TableCell className="w-[20%] text-center">{format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}</TableCell>
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
               <div className="flex justify-center space-x-2">
                  {renderActionButtons()}
               </div>
            </TableCell>
         </TableRow>

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
         <UploadStampedCertificateModal
            isOpen={isCertificateModalOpen}
            onClose={() => setIsCertificateModalOpen(false)}
            application={app}
            onComplete={handleCertificateComplete}
         />
         {(currentTab === 'Created Permits' || currentTab === 'Pending Release' || currentTab === 'Released Certificates') && (
            <CertificateViewModal
               isOpen={isViewCertModalOpen}
               onClose={() => setIsViewCertModalOpen(false)}
               certificate={certData?.getCertificatesByApplicationId[0]}
               loading={certLoading}
               error={certError}
            />
         )}
         <TS_InspectionReportsViewModal
            isOpen={isInspectionReportsModalOpen}
            onClose={() => setIsInspectionReportsModalOpen(false)}
            permitId={app.id}
         />
         <ReleaseConfirmationModal
            isOpen={isReleaseModalOpen}
            onClose={() => setIsReleaseModalOpen(false)}
            application={app}
            onComplete={onReviewComplete}
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
