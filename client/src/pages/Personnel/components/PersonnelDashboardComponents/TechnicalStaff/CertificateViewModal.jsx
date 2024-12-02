import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import CSAWCertificateTemplate from '../../CertificateComponents/certificateTemplates/CSAWCertificateTemplate';
import COVCertificateTemplate from '../../CertificateComponents/certificateTemplates/COVCertificateTemplate';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_CERTIFICATE_DETAILS = gql`
  query GetCertificateDetails($id: ID!) {
    getCertificateById(id: $id) {
      id
      certificateNumber
      applicationId
      applicationType
      certificateStatus
      dateCreated
      dateIssued
      expiryDate
      certificateData {
        registrationType
        ownerName
        address
        purpose
        chainsawDetails {
          brand
          model
          serialNumber
          dateOfAcquisition
          powerOutput
          maxLengthGuidebar
          countryOfOrigin
          purchasePrice
        }
        otherDetails
      }
      signature {
        data
        contentType
      }
      uploadedCertificate {
        fileData
        filename
        contentType
        metadata {
          certificateType
          issueDate
          expiryDate
          remarks
        }
      }
      orderOfPayment {
        officialReceipt {
          orNumber
          dateIssued
          amount
        }
      }
    }
  }
`;

const CertificateViewModal = ({ isOpen, onClose, certificate, loading, error }) => {
   const [previewUrl, setPreviewUrl] = useState(null);
   const [showECertificate, setShowECertificate] = useState(false);
   const certificateRef = useRef();
   const { data: certDetails, loading: detailsLoading } = useQuery(GET_CERTIFICATE_DETAILS, {
      variables: { id: certificate?.id },
      skip: !certificate?.id,
      fetchPolicy: 'network-only',
      pollInterval: 1000
   });

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

   const handlePreview = (fileData, contentType, filename) => {
      try {
         const byteCharacters = atob(fileData);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const file = new Blob([byteArray], { type: contentType });
         const fileUrl = URL.createObjectURL(file);

         if (contentType === 'application/pdf') {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.location = fileUrl;
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(fileData, filename, contentType);
            }
         }
         else if (contentType.startsWith('image/')) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.document.write(`
                  <html>
                     <head>
                        <title>${filename}</title>
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
                        <img src="${fileUrl}" alt="${filename}" />
                     </body>
                  </html>
               `);
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(fileData, filename, contentType);
            }
         }
         else {
            toast.error('Preview not supported for this file type. Downloading instead...');
            handleDownload(fileData, filename, contentType);
         }

         setPreviewUrl(fileUrl);
      } catch (error) {
         console.error('Error previewing file:', error);
         toast.error('Error previewing file');
      }
   };

   useEffect(() => {
      return () => {
         if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
         }
      };
   }, [previewUrl]);

   const renderCertificateTemplate = () => {
      const certData = certDetails?.getCertificateById || certificate;

      switch (certData.applicationType) {
         case 'Chainsaw Registration':
            return (
               <CSAWCertificateTemplate
                  ref={certificateRef}
                  certificate={certData}
                  application={certData.certificateData}
                  orderOfPayment={certData.orderOfPayment}
                  hiddenOnPrint={[]}
               />
            );
         case 'Certificate of Verification':
            // Merge certificateData with otherDetails for COV
            const covData = {
               ...certData.certificateData,
               name: certData.certificateData.ownerName,
               driverName: certData.certificateData.otherDetails?.driverName,
               driverLicenseNumber: certData.certificateData.otherDetails?.driverLicenseNumber,
               vehiclePlateNumber: certData.certificateData.otherDetails?.vehiclePlateNumber,
               originAddress: certData.certificateData.otherDetails?.originAddress,
               destinationAddress: certData.certificateData.otherDetails?.destinationAddress
            };

            return (
               <COVCertificateTemplate
                  ref={certificateRef}
                  certificate={certData}
                  application={covData}
                  orderOfPayment={certData.orderOfPayment}
                  hiddenOnPrint={[]}
               />
            );
         default:
            return null;
      }
   };

   if (loading) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
               <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   if (error) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
               <DialogHeader>
                  <DialogTitle className="text-red-500">Error</DialogTitle>
                  <DialogDescription>{error.message}</DialogDescription>
               </DialogHeader>
            </DialogContent>
         </Dialog>
      );
   }

   if (!certificate) return null;

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className={showECertificate ? "max-w-4xl" : "max-w-md"}>
            {showECertificate ? (
               <>
                  <DialogHeader>
                     <DialogTitle>E-Certificate Preview</DialogTitle>
                  </DialogHeader>

                  <div className="overflow-auto max-h-[70vh]">
                     {renderCertificateTemplate()}
                  </div>

                  <DialogFooter>
                     <Button variant="outline" onClick={() => setShowECertificate(false)}>
                        Back
                     </Button>
                  </DialogFooter>
               </>
            ) : (
               <>
                  <DialogHeader>
                     <DialogTitle>Certificate Details</DialogTitle>
                     <DialogDescription>
                        Certificate Number: {certificate.certificateNumber}
                     </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                     {/* Certificate Type Section */}
                     {/* <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Certificate Type</h3>
                        <p>{certificate.applicationType}</p>
                     </div> */}

                     <Separator />

                     {/* Issue Details Section */}
                     <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Issue Details</h3>
                        <div className="space-y-2">
                           {certificate.dateIssued && (
                              <div>
                                 <span className="text-sm">Date Issued: </span>
                                 <span className="text-sm">
                                    {format(new Date(parseInt(certificate.dateIssued)), 'PPP')}
                                 </span>
                              </div>
                           )}
                           {certificate.expiryDate && (
                              <div>
                                 <span className="text-sm">Expiry Date: </span>
                                 <span className="text-sm">
                                    {format(new Date(parseInt(certificate.expiryDate)), 'PPP')}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>

                     <Separator />

                     {/* Status Section */}
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <Badge variant={certificate.certificateStatus === 'Active' ? 'success' : 'secondary'}>
                           {certificate.certificateStatus}
                        </Badge>
                     </div>

                     <Separator />

                     {/* Actions Section */}
                     <div className="space-y-2">
                        <Button
                           className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                           onClick={() => setShowECertificate(true)}
                        >
                           <Eye className="h-4 w-4 mr-2" />
                           View Certificate
                        </Button>

                        {certificate.uploadedCertificate && (
                           <div className="grid grid-cols-2 gap-2">
                              <Button
                                 variant="outline"
                                 onClick={() => handlePreview(
                                    certificate.uploadedCertificate.fileData,
                                    certificate.uploadedCertificate.contentType,
                                    certificate.uploadedCertificate.filename
                                 )}
                              >
                                 <Eye className="h-4 w-4 mr-2" />
                                 Preview Upload
                              </Button>

                              <Button
                                 variant="outline"
                                 onClick={() => handleDownload(
                                    certificate.uploadedCertificate.fileData,
                                    certificate.uploadedCertificate.filename,
                                    certificate.uploadedCertificate.contentType
                                 )}
                              >
                                 <Download className="h-4 w-4 mr-2" />
                                 Download
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>

                  <DialogFooter>
                     <Button variant="outline" onClick={onClose}>Close</Button>
                  </DialogFooter>
               </>
            )}
         </DialogContent>
      </Dialog>
   );
};

export default CertificateViewModal;
