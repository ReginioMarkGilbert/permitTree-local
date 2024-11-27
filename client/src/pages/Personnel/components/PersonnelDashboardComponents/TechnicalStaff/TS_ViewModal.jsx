// Technical Staff View Modal

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, Loader2 } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery, gql } from '@apollo/client';
import CSAWDetailsRenderer from '../../ApplicationDetailsRenderers/CSAWDetailsRenderer';
import COVDetailsRenderer from '../../ApplicationDetailsRenderers/COVDetailsRenderer';
import PTPRDetailsRenderer from '../../ApplicationDetailsRenderers/PTPRDetailsRenderer';
import PLTCPDetailsRenderer from '../../ApplicationDetailsRenderers/PLTCPDetailsRenderer';
import PLTPDetailsRenderer from '../../ApplicationDetailsRenderers/PLTPDetailsRenderer';
import TCEBPDetailsRenderer from '../../ApplicationDetailsRenderers/TCEBPDetailsRenderer';
import { toast } from 'react-hot-toast';

// Add GraphQL queries for each permit type
const GET_CSAW_PERMIT = gql`
  query GetCSAWPermit($id: ID!) {
    getCSAWPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      registrationType
      chainsawStore
      ownerName
      address
      phone
      brand
      model
      serialNumber
      dateOfAcquisition
      powerOutput
      maxLengthGuidebar
      countryOfOrigin
      purchasePrice
      isOwner
      isTenureHolder
      isBusinessOwner
      isPTPRHolder
      isWPPHolder
      files {
        officialReceipt {
          filename
          contentType
          data
        }
        deedOfSale {
          filename
          contentType
          data
        }
        specialPowerOfAttorney {
          filename
          contentType
          data
        }
        forestTenureAgreement {
          filename
          contentType
          data
        }
        businessPermit {
          filename
          contentType
          data
        }
        certificateOfRegistration {
          filename
          contentType
          data
        }
        woodProcessingPlantPermit {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const GET_COV_PERMIT = gql`
  query GetCOVPermit($id: ID!) {
    getCOVPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      name
      address
      cellphone
      purpose
      driverName
      driverLicenseNumber
      vehiclePlateNumber
      originAddress
      destinationAddress
      files {
        letterOfIntent {
          filename
          contentType
          data
        }
        tallySheet {
          filename
          contentType
          data
        }
        forestCertification {
          filename
          contentType
          data
        }
        orCr {
          filename
          contentType
          data
        }
        driverLicense {
          filename
          contentType
          data
        }
        specialPowerOfAttorney {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const GET_PTPR_PERMIT = gql`
  query GetPTPRPermit($id: ID!) {
    getPTPRPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      ownerName
      address
      contactNumber
      lotArea
      treeSpecies
      totalTrees
      treeSpacing
      yearPlanted
      files {
        letterRequest {
          filename
          contentType
          data
        }
        titleOrTaxDeclaration {
          filename
          contentType
          data
        }
        darCertification {
          filename
          contentType
          data
        }
        specialPowerOfAttorney {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const GET_PLTCP_PERMIT = gql`
  query GetPLTCPPermit($id: ID!) {
    getPLTCPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      name
      address
      contactNumber
      treeType
      treeStatus
      landType
      posingDanger
      forPersonalUse
      purpose
      files {
        applicationLetter {
          filename
          contentType
          data
        }
        lguEndorsement {
          filename
          contentType
          data
        }
        homeownersResolution {
          filename
          contentType
          data
        }
        ptaResolution {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const GET_PLTP_PERMIT = gql`
  query GetPLTPPermit($id: ID!) {
    getPLTPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      name
      address
      contactNumber
      plantedTrees
      naturallyGrown
      standing
      blownDown
      withinPrivateLand
      withinTenuredForestLand
      posingDanger
      forPersonalUse
      purpose
      files {
        letterOfIntent {
          filename
          contentType
          data
        }
        lguEndorsement {
          filename
          contentType
          data
        }
        titleCertificate {
          filename
          contentType
          data
        }
        darCertificate {
          filename
          contentType
          data
        }
        specialPowerOfAttorney {
          filename
          contentType
          data
        }
        ptaResolution {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const GET_TCEBP_PERMIT = gql`
  query GetTCEBPPermit($id: ID!) {
    getTCEBPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      name
      address
      contactNumber
      requestType
      purpose
      files {
        letterOfIntent {
          filename
          contentType
          data
        }
        lguEndorsement {
          filename
          contentType
          data
        }
        landTenurial {
          filename
          contentType
          data
        }
        siteDevelopmentPlan {
          filename
          contentType
          data
        }
        environmentalCompliance {
          filename
          contentType
          data
        }
        fpic {
          filename
          contentType
          data
        }
        ownerConsent {
          filename
          contentType
          data
        }
        pambClearance {
          filename
          contentType
          data
        }
      }
    }
  }
`;

const TS_ViewModal = ({ isOpen, onClose, application }) => {
   const [permitData, setPermitData] = useState(null);

   // Query for CSAW permit data
   const { loading: csawLoading, error: csawError, data: csawData } = useQuery(GET_CSAW_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id || application?.applicationType !== 'Chainsaw Registration',
   });

   // Query for COV permit data
   const { loading: covLoading, error: covError, data: covData } = useQuery(GET_COV_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id || application?.applicationType !== 'Certificate of Verification',
   });

   // Query for PTPR permit data
   const { loading: ptprLoading, error: ptprError, data: ptprData } = useQuery(GET_PTPR_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id || application?.applicationType !== 'Private Tree Plantation Registration',
   });

   // Query for PLTCP permit data
   const { loading: pltcpLoading, error: pltcpError, data: pltcpData } = useQuery(GET_PLTCP_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id || application?.applicationType !== 'Public Land Tree Cutting Permit',
   });

   // Query for PLTP permit data
   const { loading: pltpLoading, error: pltpError, data: pltpData } = useQuery(GET_PLTP_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id || application?.applicationType !== 'Private Land Timber Permit',
   });

   // Query for TCEBP permit data
   const { loading: tcebpLoading, error: tcebpError, data: tcebpData } = useQuery(GET_TCEBP_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id || application?.applicationType !== 'Tree Cutting and/or Earth Balling Permit',
   });

   useEffect(() => {
      if (csawData?.getCSAWPermitById) {
         setPermitData(csawData.getCSAWPermitById);
      } else if (covData?.getCOVPermitById) {
         setPermitData(covData.getCOVPermitById);
      } else if (ptprData?.getPTPRPermitById) {
         setPermitData(ptprData.getPTPRPermitById);
      } else if (pltcpData?.getPLTCPPermitById) {
         setPermitData(pltcpData.getPLTCPPermitById);
      } else if (pltpData?.getPLTPPermitById) {
         setPermitData(pltpData.getPLTPPermitById);
      } else if (tcebpData?.getTCEBPPermitById) {
         setPermitData(tcebpData.getTCEBPPermitById);
      }
   }, [csawData, covData, ptprData, pltcpData, pltpData, tcebpData]);

   if (!application) return null;

   const handleDownload = (file) => {
      const byteCharacters = atob(file.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.contentType });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handlePreview = (file) => {
      try {
         const byteCharacters = atob(file.data);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const blob = new Blob([byteArray], { type: file.contentType });
         const fileUrl = URL.createObjectURL(blob);

         // For images
         if (file.contentType.startsWith('image/')) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.document.write(`
                  <html>
                     <head>
                        <title>${file.filename}</title>
                        <style>
                           body {
                              margin: 0;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              min-height: 100vh;
                              background: #f1f5f9;
                           }
                           img {
                              max-width: 100%;
                              max-height: 100vh;
                              object-fit: contain;
                           }
                        </style>
                     </head>
                     <body>
                        <img src="${fileUrl}" alt="${file.filename}" />
                     </body>
                  </html>
               `);
               newWindow.document.close();

               // Clean up URL after a delay
               setTimeout(() => {
                  URL.revokeObjectURL(fileUrl);
               }, 1000);
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(file);
            }
         }
         // For PDFs
         else if (file.contentType === 'application/pdf') {
            // Create an iframe to display the PDF
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.location = fileUrl;

               // Clean up
               setTimeout(() => {
                  URL.revokeObjectURL(fileUrl);
                  document.body.removeChild(iframe);
               }, 1000);
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(file);
               URL.revokeObjectURL(fileUrl);
               document.body.removeChild(iframe);
            }
         }
         // For other file types
         else {
            toast.error('Preview not supported for this file type. Downloading instead...');
            handleDownload(file);
            URL.revokeObjectURL(fileUrl);
         }
      } catch (error) {
         console.error('Preview error:', error);
         toast.error('Failed to preview file. Downloading instead...');
         handleDownload(file);
      }
   };

   if (csawLoading || covLoading || ptprLoading || pltcpLoading || pltpLoading || tcebpLoading) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
               <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   if (csawError || covError || ptprError || pltcpError || pltpError || tcebpError) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
               <div className="text-red-500 p-6">
                  Error loading permit details: {csawError?.message || covError?.message || ptprError?.message || pltcpError?.message || pltpError?.message || tcebpError?.message}
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Application Details</DialogTitle>
               <DialogDescription>
                  Application Number: {application.applicationNumber}
               </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-grow pr-4">
               <div className="space-y-4 pb-4">
                  <div className="flex justify-between items-center">
                     <div>
                        <h3 className="font-semibold text-sm text-gray-500">Application Type</h3>
                        <p>{application.applicationType}</p>
                     </div>
                     <Badge variant="outline" className={
                        application.status === 'Approved' ? 'bg-green-100 text-green-800' :
                           application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                     }>
                        {application.status}
                     </Badge>
                  </div>

                  <Separator />

                  {application.applicationType === 'Chainsaw Registration' && (
                     <CSAWDetailsRenderer
                        data={permitData || application}
                        handlePreview={handlePreview}
                        handleDownload={handleDownload}
                     />
                  )}
                  {application.applicationType === 'Certificate of Verification' && (
                     <COVDetailsRenderer
                        data={permitData || application}
                        handlePreview={handlePreview}
                        handleDownload={handleDownload}
                     />
                  )}
                  {application.applicationType === 'Private Tree Plantation Registration' && (
                     <PTPRDetailsRenderer
                        data={permitData || application}
                        handlePreview={handlePreview}
                        handleDownload={handleDownload}
                     />
                  )}
                  {application.applicationType === 'Public Land Tree Cutting Permit' && (
                     <PLTCPDetailsRenderer
                        data={permitData || application}
                        handlePreview={handlePreview}
                        handleDownload={handleDownload}
                     />
                  )}
                  {application.applicationType === 'Private Land Timber Permit' && (
                     <PLTPDetailsRenderer
                        data={permitData || application}
                        handlePreview={handlePreview}
                        handleDownload={handleDownload}
                     />
                  )}
                  {application.applicationType === 'Tree Cutting and/or Earth Balling Permit' && (
                     <TCEBPDetailsRenderer
                        data={permitData || application}
                        handlePreview={handlePreview}
                        handleDownload={handleDownload}
                     />
                  )}
               </div>
            </ScrollArea>

            <DialogFooter>
               <Button onClick={onClose}>Close</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default TS_ViewModal;
