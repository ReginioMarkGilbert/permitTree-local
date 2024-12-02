import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation, gql, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { X, Upload, Eye, FileText, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import CSAWCertificateTemplate from '../../CertificateComponents/certificateTemplates/CSAWCertificateTemplate';
import COVCertificateTemplate from '../../CertificateComponents/certificateTemplates/COVCertificateTemplate';
import PTPRCertificateTemplate from '../../CertificateComponents/certificateTemplates/PTPRCertificateTemplate';
import PLTCPCertificateTemplate from '../../CertificateComponents/certificateTemplates/PLTCPCertificateTemplate';
import PLTPCertificateTemplate from '../../CertificateComponents/certificateTemplates/PLTPCertificateTemplate';
import { cn } from '@/lib/utils';

const UPLOAD_CERTIFICATE = gql`
  mutation UploadCertificate($input: UploadCertificateInput!) {
    uploadCertificate(input: $input) {
      id
      certificateNumber
      certificateStatus
      dateCreated
      uploadedCertificate {
        fileData
        filename
        contentType
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

const GENERATE_CERTIFICATE = gql`
  mutation GenerateCertificate($input: GenerateCertificateInput!) {
    generateCertificate(input: $input) {
      id
      certificateNumber
      certificateStatus
      dateCreated
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
      orderOfPayment {
        officialReceipt {
          orNumber
          dateIssued
        }
      }
    }
  }
`;

const GET_CSAW_PERMIT = gql`
  query GetCSAWPermit($id: ID!) {
    getCSAWPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      registrationType
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
      hasCertificate
      certificateId
    }
  }
`;

const GET_COV_PERMIT = gql`
  query GetCOVPermit($id: ID!) {
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
      hasCertificate
      certificateId
    }
  }
`;

const GET_PTPR_PERMIT = gql`
  query GetPTPRPermit($id: ID!) {
    getPTPRPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      ownerName
      address
      contactNumber
      lotArea
      treeSpecies
      totalTrees
      treeSpacing
      yearPlanted
      hasCertificate
      certificateId
    }
  }
`;

const GET_PLTCP_PERMIT = gql`
  query GetPLTCPPermit($id: ID!) {
    getPLTCPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      name
      address
      contactNumber
      treeType
      treeStatus
      landType
      posingDanger
      forPersonalUse
      purpose
      hasCertificate
      certificateId
    }
  }
`;

const GET_PLTP_PERMIT = gql`
  query GetPLTPPermit($id: ID!) {
    getPLTPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
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
      hasCertificate
      certificateId
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $awaitingPermitCreation: Boolean,
    $PermitCreated: Boolean,
    $hasCertificate: Boolean,
    $certificateId: ID
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      awaitingPermitCreation: $awaitingPermitCreation,
      PermitCreated: $PermitCreated,
      hasCertificate: $hasCertificate,
      certificateId: $certificateId
    ) {
      id
      currentStage
      status
      awaitingPermitCreation
      PermitCreated
      hasCertificate
      certificateId
    }
  }
`;

const UploadCertificateModal = ({ isOpen, onClose, application, onComplete }) => {
   const [isUploading, setIsUploading] = useState(false);
   const [certificateFile, setCertificateFile] = useState(null);
   const [metadata, setMetadata] = useState({
      issueDate: '',
      remarks: ''
   });
   const [generatedCertificate, setGeneratedCertificate] = useState(null);
   const certificateRef = useRef();
   const [showECertificate, setShowECertificate] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);

   const [uploadCertificate] = useMutation(UPLOAD_CERTIFICATE);
   const [generateCertificateMutation] = useMutation(GENERATE_CERTIFICATE);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   const { data: csawData, loading: csawLoading } = useQuery(GET_CSAW_PERMIT, {
      variables: { id: application.id },
      skip: !application.id || application.applicationType !== 'Chainsaw Registration',
   });

   const { data: covData, loading: covLoading } = useQuery(GET_COV_PERMIT, {
      variables: { id: application.id },
      skip: !application.id || application.applicationType !== 'Certificate of Verification',
   });

   const { data: ptprData, loading: ptprLoading } = useQuery(GET_PTPR_PERMIT, {
      variables: { id: application.id },
      skip: !application.id || application.applicationType !== 'Private Tree Plantation Registration',
   });

   const { data: pltcpData, loading: pltcpLoading } = useQuery(GET_PLTCP_PERMIT, {
      variables: { id: application.id },
      skip: !application.id || application.applicationType !== 'Public Land Tree Cutting Permit',
   });

   const { data: pltpData, loading: pltpLoading } = useQuery(GET_PLTP_PERMIT, {
      variables: { id: application.id },
      skip: !application.id || application.applicationType !== 'Private Land Timber Permit',
   });

   const applicationData = (() => {
      switch (application.applicationType) {
         case 'Chainsaw Registration':
            return csawData?.getCSAWPermitById;
         case 'Certificate of Verification':
            return covData?.getCOVPermitById;
         case 'Private Tree Plantation Registration':
            return ptprData?.getPTPRPermitById;
         case 'Public Land Tree Cutting Permit':
            return pltcpData?.getPLTCPPermitById;
         case 'Private Land Timber Permit':
            return pltpData?.getPLTPPermitById;
         default:
            return null;
      }
   })();

   const isLoading = (() => {
      switch (application.applicationType) {
         case 'Chainsaw Registration':
            return csawLoading;
         case 'Certificate of Verification':
            return covLoading;
         case 'Private Tree Plantation Registration':
            return ptprLoading;
         case 'Public Land Tree Cutting Permit':
            return pltcpLoading;
         case 'Private Land Timber Permit':
            return pltpLoading;
         default:
            return false;
      }
   })();

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         console.log('Selected file:', file);
         setCertificateFile(file);
      }
   };

   const handleRemoveFile = () => {
      setCertificateFile(null);
   };

   const handleMetadataChange = (e) => {
      const { name, value } = e.target;
      setMetadata(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
         };
         reader.onerror = (error) => reject(error);
      });
   };

   const handlePrint = useReactToPrint({
      content: () => certificateRef.current,
      documentTitle: `Certificate-${application?.applicationNumber}`,
   });

   const handleUpload = async () => {
      if (!certificateFile) {
         toast.error('Please select a certificate file to upload');
         return;
      }

      if (!metadata.issueDate) {
         toast.error('Please set the issue date');
         return;
      }

      setIsUploading(true);
      try {
         const fileData = await fileToBase64(certificateFile);
         const issueDate = new Date(metadata.issueDate);

         const { data } = await uploadCertificate({
            variables: {
               input: {
                  applicationId: application.id,
                  applicationType: application.applicationType,
                  uploadedCertificate: {
                     fileData,
                     filename: certificateFile.name,
                     contentType: certificateFile.type,
                     metadata: {
                        certificateType: application.applicationType,
                        issueDate: issueDate.toISOString(),
                        remarks: metadata.remarks || ''
                     }
                  }
               }
            }
         });

         if (data?.uploadCertificate) {
            // Update permit stage after successful certificate upload
            await updatePermitStage({
               variables: {
                  id: application.id,
                  currentStage: 'PendingSignatureByPENRCENROfficer',
                  status: 'In Progress',
                  awaitingPermitCreation: false,
                  PermitCreated: true,
                  hasCertificate: true,
                  certificateId: data.uploadCertificate.id
               }
            });

            toast.success('Certificate uploaded successfully');
            onComplete(data.uploadCertificate);
            onClose();
         } else {
            throw new Error('Failed to upload certificate');
         }
      } catch (error) {
         console.error('Error uploading certificate:', error);
         toast.error(error.message || 'Failed to upload certificate');
      } finally {
         setIsUploading(false);
      }
   };

   const generateECertificate = async () => {
      if (isLoading) {
         toast.error('Loading application details...');
         return;
      }

      setIsGenerating(true);
      try {
         if (!applicationData) {
            toast.error('Application details not found');
            return;
         }

         if (applicationData.hasCertificate) {
            toast.error('Certificate already exists for this application');
            return;
         }

         let certificateData;
         switch (application.applicationType) {
            case 'Chainsaw Registration':
               certificateData = {
                  registrationType: applicationData.registrationType,
                  ownerName: applicationData.ownerName,
                  address: applicationData.address,
                  purpose: "For Cutting/Slicing of Planted trees with cutting permits and coconut within Private Land",
                  chainsawDetails: {
                     brand: applicationData.brand,
                     model: applicationData.model,
                     serialNumber: applicationData.serialNumber,
                     dateOfAcquisition: applicationData.dateOfAcquisition,
                     powerOutput: applicationData.powerOutput,
                     maxLengthGuidebar: applicationData.maxLengthGuidebar,
                     countryOfOrigin: applicationData.countryOfOrigin,
                     purchasePrice: parseFloat(applicationData.purchasePrice)
                  }
               };
               break;
            case 'Certificate of Verification':
               certificateData = {
                  registrationType: 'Certificate of Verification',
                  ownerName: applicationData.name,
                  address: applicationData.address,
                  purpose: applicationData.purpose,
                  otherDetails: {
                     driverName: applicationData.driverName,
                     driverLicenseNumber: applicationData.driverLicenseNumber,
                     vehiclePlateNumber: applicationData.vehiclePlateNumber,
                     originAddress: applicationData.originAddress,
                     destinationAddress: applicationData.destinationAddress
                  }
               };
               break;
            case 'Private Tree Plantation Registration':
               console.log('PTPR Application Data:', applicationData); // Debug log

               certificateData = {
                  registrationType: 'Private Tree Plantation Registration',
                  ownerName: applicationData.ownerName,
                  address: applicationData.address,
                  purpose: "For registration of private tree plantation",
                  otherDetails: {
                     lotArea: Number(applicationData.lotArea),  // Ensure number conversion
                     treeSpecies: applicationData.treeSpecies,  // Already an array
                     totalTrees: Number(applicationData.totalTrees),  // Ensure number conversion
                     treeSpacing: String(applicationData.treeSpacing),
                     yearPlanted: Number(applicationData.yearPlanted),  // Ensure number conversion
                     contactNumber: String(applicationData.contactNumber)
                  }
               };

               console.log('PTPR Certificate Data:', certificateData); // Debug log
               break;
            case 'Public Land Tree Cutting Permit':
               console.log('PLTCP Application Data:', applicationData); // Debug log

               certificateData = {
                  registrationType: 'Public Land Tree Cutting Permit',
                  ownerName: applicationData.name,
                  address: applicationData.address,
                  purpose: applicationData.purpose,
                  otherDetails: {
                     treeType: applicationData.treeType,
                     treeStatus: applicationData.treeStatus,
                     landType: applicationData.landType,
                     posingDanger: applicationData.posingDanger,
                     forPersonalUse: applicationData.forPersonalUse,
                     contactNumber: applicationData.contactNumber
                  }
               };

               console.log('PLTCP Certificate Data:', certificateData); // Debug log
               break;
            case 'Private Land Timber Permit':
               console.log('PLTP Application Data:', applicationData); // Debug log

               certificateData = {
                  registrationType: 'Private Land Timber Permit',
                  ownerName: applicationData.name,
                  address: applicationData.address,
                  purpose: applicationData.purpose,
                  otherDetails: {
                     plantedTrees: applicationData.plantedTrees,
                     naturallyGrown: applicationData.naturallyGrown,
                     standing: applicationData.standing,
                     blownDown: applicationData.blownDown,
                     withinPrivateLand: applicationData.withinPrivateLand,
                     withinTenuredForestLand: applicationData.withinTenuredForestLand,
                     posingDanger: applicationData.posingDanger,
                     forPersonalUse: applicationData.forPersonalUse,
                     contactNumber: applicationData.contactNumber
                  }
               };

               console.log('PLTP Certificate Data:', certificateData); // Debug log
               break;
            default:
               throw new Error('Unsupported application type');
         }

         const { data } = await generateCertificateMutation({
            variables: {
               input: {
                  applicationId: applicationData.id,
                  applicationType: application.applicationType,
                  certificateData
               }
            }
         });

         if (data?.generateCertificate) {
            setGeneratedCertificate(data.generateCertificate);
            toast.success('E-Certificate generated successfully');
         }
      } catch (error) {
         console.error('Error generating certificate:', error);
         toast.error(`Failed to generate e-certificate: ${error.message}`);
      } finally {
         setIsGenerating(false);
      }
   };

   const renderCertificateTemplate = () => {
      if (!generatedCertificate) return null;

      switch (application.applicationType) {
         case 'Chainsaw Registration':
            return (
               <div style={{ display: 'none' }}>
                  <CSAWCertificateTemplate
                     ref={certificateRef}
                     certificate={generatedCertificate}
                     application={generatedCertificate.certificateData}
                     hiddenOnPrint={[]}
                  />
               </div>
            );
         case 'Certificate of Verification':
            return (
               <div style={{ display: 'none' }}>
                  <COVCertificateTemplate
                     ref={certificateRef}
                     certificate={generatedCertificate}
                     application={generatedCertificate.certificateData}
                     hiddenOnPrint={[]}
                  />
               </div>
            );
         case 'Private Tree Plantation Registration':
            return (
               <div style={{ display: 'none' }}>
                  <PTPRCertificateTemplate
                     ref={certificateRef}
                     certificate={generatedCertificate}
                     application={generatedCertificate.certificateData}
                     hiddenOnPrint={[]}
                  />
               </div>
            );
         case 'Public Land Tree Cutting Permit':
            return (
               <div style={{ display: 'none' }}>
                  <PLTCPCertificateTemplate
                     ref={certificateRef}
                     certificate={generatedCertificate}
                     application={generatedCertificate.certificateData}
                     hiddenOnPrint={[]}
                  />
               </div>
            );
         case 'Private Land Timber Permit':
            return (
               <div style={{ display: 'none' }}>
                  <PLTPCertificateTemplate
                     ref={certificateRef}
                     certificate={generatedCertificate}
                     application={generatedCertificate.certificateData}
                     hiddenOnPrint={[]}
                  />
               </div>
            );
         default:
            return null;
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className={showECertificate ? "max-w-4xl" : "max-w-md"}>
            {showECertificate ? (
               <>
                  <DialogHeader>
                     <DialogTitle>E-Certificate Preview</DialogTitle>
                  </DialogHeader>

                  <div className="overflow-auto max-h-[70vh]">
                     {(() => {
                        switch (application.applicationType) {
                           case 'Chainsaw Registration':
                              return (
                                 <CSAWCertificateTemplate
                                    certificate={generatedCertificate}
                                    application={generatedCertificate.certificateData}
                                    hiddenOnPrint={[]}
                                 />
                              );
                           case 'Certificate of Verification':
                              return (
                                 <COVCertificateTemplate
                                    certificate={generatedCertificate}
                                    application={generatedCertificate.certificateData}
                                    hiddenOnPrint={[]}
                                 />
                              );
                           case 'Private Tree Plantation Registration':
                              return (
                                 <PTPRCertificateTemplate
                                    certificate={generatedCertificate}
                                    application={generatedCertificate.certificateData}
                                    hiddenOnPrint={[]}
                                 />
                              );
                           case 'Public Land Tree Cutting Permit':
                              return (
                                 <PLTCPCertificateTemplate
                                    certificate={generatedCertificate}
                                    application={generatedCertificate.certificateData}
                                    hiddenOnPrint={[]}
                                 />
                              );
                           case 'Private Land Timber Permit':
                              return (
                                 <PLTPCertificateTemplate
                                    certificate={generatedCertificate}
                                    application={generatedCertificate.certificateData}
                                    hiddenOnPrint={[]}
                                 />
                              );
                           default:
                              return null;
                        }
                     })()}
                  </div>

                  <div className="flex justify-end gap-2">
                     <Button variant="outline" onClick={() => setShowECertificate(false)}>
                        Back
                     </Button>
                     <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                        Print Certificate
                     </Button>
                  </div>
               </>
            ) : (
               <>
                  <DialogHeader>
                     <DialogTitle>Upload Certificate</DialogTitle>
                     <DialogDescription>
                        {application.applicationNumber} - {application.applicationType}
                     </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                     {/* E-Certificate Generation */}
                     <div>
                        <Label className="text-sm font-medium mb-2 block">E-Certificate</Label>
                        <div className="flex gap-2">
                           <Button
                              onClick={generateECertificate}
                              className="bg-blue-600 hover:bg-blue-700 flex-1"
                              disabled={generatedCertificate !== null || isGenerating}
                           >
                              {isGenerating ? (
                                 <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                 </>
                              ) : (
                                 <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate
                                 </>
                              )}
                           </Button>
                           {generatedCertificate && (
                              <Button
                                 onClick={() => setShowECertificate(true)}
                                 variant="outline"
                              >
                                 <Eye className="h-4 w-4 mr-2" />
                                 Preview
                              </Button>
                           )}
                        </div>
                     </div>

                     <Separator />

                     {/* Physical Certificate Upload */}
                     <div>
                        <Label className="text-sm font-medium mb-2 block">Physical Certificate</Label>
                        {certificateFile ? (
                           <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                              <span className="text-sm truncate max-w-[200px]">
                                 {certificateFile.name}
                              </span>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={handleRemoveFile}
                                 disabled={isUploading}
                              >
                                 <X className="h-4 w-4" />
                              </Button>
                           </div>
                        ) : (
                           <div className="border-2 border-dashed rounded-md p-4 text-center">
                              <Input
                                 id="certificate-file"
                                 type="file"
                                 accept=".pdf,.doc,.docx"
                                 onChange={handleFileChange}
                                 className="hidden"
                                 disabled={isUploading}
                              />
                              <Label
                                 htmlFor="certificate-file"
                                 className={cn(
                                    "cursor-pointer block",
                                    isUploading && "opacity-50 cursor-not-allowed"
                                 )}
                              >
                                 {isUploading ? (
                                    <>
                                       <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-muted-foreground" />
                                       <span className="text-sm">Uploading...</span>
                                    </>
                                 ) : (
                                    <>
                                       <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                       <span className="text-sm">Upload Certificate</span>
                                    </>
                                 )}
                              </Label>
                           </div>
                        )}
                     </div>

                     {/* Metadata Fields */}
                     <div className="grid gap-3">
                        <div>
                           <Label>Issue Date</Label>
                           <Input
                              type="date"
                              name="issueDate"
                              value={metadata.issueDate}
                              onChange={handleMetadataChange}
                           />
                        </div>
                        <div>
                           <Label>Remarks</Label>
                           <Input
                              type="text"
                              name="remarks"
                              value={metadata.remarks}
                              onChange={handleMetadataChange}
                              placeholder="Optional remarks"
                           />
                        </div>
                     </div>
                  </div>

                  {renderCertificateTemplate()}

                  <div className="flex justify-end gap-2">
                     <Button variant="outline" onClick={onClose}>
                        Cancel
                     </Button>
                     <Button
                        onClick={handleUpload}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isUploading || !certificateFile}
                     >
                        {isUploading ? 'Uploading...' : 'Upload'}
                     </Button>
                  </div>
               </>
            )}
         </DialogContent>
      </Dialog>
   );
};

export default UploadCertificateModal;
