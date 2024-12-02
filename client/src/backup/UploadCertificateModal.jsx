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

const GET_APPLICATION_DETAILS = gql`
  query GetApplicationDetails($id: ID!) {
    getPermitById(id: $id) {
      ... on CSAWPermit {
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
      ... on COVPermit {
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
      expiryDate: '',
      remarks: ''
   });
   const [generatedCertificate, setGeneratedCertificate] = useState(null);
   const certificateRef = useRef();
   const [showECertificate, setShowECertificate] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);

   const [uploadCertificate] = useMutation(UPLOAD_CERTIFICATE);
   const [generateCertificateMutation] = useMutation(GENERATE_CERTIFICATE);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);

   const { data: applicationData, loading: applicationLoading, error: applicationError } = useQuery(GET_APPLICATION_DETAILS, {
      variables: { id: application.id },
      skip: !application.id,
      onCompleted: (data) => {
         console.log('Application data loaded:', data);
      },
      onError: (error) => {
         console.error('Error loading application:', error);
      }
   });

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
      if (applicationLoading) {
         toast.error('Loading application details...');
         return;
      }

      setIsGenerating(true);
      try {
         const fullApplication = applicationData?.getCSAWPermitById;
         if (!fullApplication) {
            toast.error('Application details not found');
            return;
         }

         if (fullApplication.hasCertificate) {
            toast.error('Certificate already exists for this application');
            return;
         }

         const certificateData = {
            registrationType: fullApplication.registrationType,
            ownerName: fullApplication.ownerName,
            address: fullApplication.address,
            purpose: "For Cutting/Slicing of Planted trees with cutting permits and coconut within Private Land",
            chainsawDetails: {
               brand: fullApplication.brand,
               model: fullApplication.model,
               serialNumber: fullApplication.serialNumber,
               dateOfAcquisition: fullApplication.dateOfAcquisition,
               powerOutput: fullApplication.powerOutput,
               maxLengthGuidebar: fullApplication.maxLengthGuidebar,
               countryOfOrigin: fullApplication.countryOfOrigin,
               purchasePrice: parseFloat(fullApplication.purchasePrice)
            }
         };

         console.log('Certificate Data:', certificateData);

         const { data } = await generateCertificateMutation({
            variables: {
               input: {
                  applicationId: fullApplication.id,
                  applicationType: fullApplication.applicationType,
                  certificateData
               }
            }
         });

         setGeneratedCertificate(data.generateCertificate);
         toast.success('E-Certificate generated successfully');
      } catch (error) {
         console.error('Error generating certificate:', error);
         toast.error(`Failed to generate e-certificate: ${error.message}`);
      } finally {
         setIsGenerating(false);
      }
   };

   const handleViewECertificate = () => {
      setShowECertificate(true);
   };

   const renderCertificateTemplate = () => {
      switch (application.applicationType) {
         case 'Chainsaw Registration':
            return (
               <CSAWCertificateTemplate
                  ref={certificateRef}
                  certificate={generatedCertificate || {}}
                  application={applicationData?.getCSAWPermitById}
                  orderOfPayment={application.orderOfPayment}
               />
            );
         case 'Certificate of Verification':
            return (
               <COVCertificateTemplate
                  ref={certificateRef}
                  certificate={generatedCertificate || {}}
                  application={applicationData?.getCOVPermitById}
                  orderOfPayment={application.orderOfPayment}
               />
            );
         default:
            return null;
      }
   };

   const generateCertificateData = () => {
      switch (application.applicationType) {
         case 'Chainsaw Registration':
            return {
               registrationType: applicationData?.getCSAWPermitById?.registrationType,
               ownerName: applicationData?.getCSAWPermitById?.ownerName,
               address: applicationData?.getCSAWPermitById?.address,
               chainsawDetails: {
                  brand: applicationData?.getCSAWPermitById?.brand,
                  model: applicationData?.getCSAWPermitById?.model,
                  serialNumber: applicationData?.getCSAWPermitById?.serialNumber,
                  dateOfAcquisition: applicationData?.getCSAWPermitById?.dateOfAcquisition,
                  powerOutput: applicationData?.getCSAWPermitById?.powerOutput,
                  maxLengthGuidebar: applicationData?.getCSAWPermitById?.maxLengthGuidebar,
                  countryOfOrigin: applicationData?.getCSAWPermitById?.countryOfOrigin,
                  purchasePrice: applicationData?.getCSAWPermitById?.purchasePrice
               }
            };
         case 'Certificate of Verification':
            return {
               name: applicationData?.getCOVPermitById?.name,
               address: applicationData?.getCOVPermitById?.address,
               purpose: applicationData?.getCOVPermitById?.purpose,
               transportDetails: {
                  driverName: applicationData?.getCOVPermitById?.driverName,
                  driverLicenseNumber: applicationData?.getCOVPermitById?.driverLicenseNumber,
                  vehiclePlateNumber: applicationData?.getCOVPermitById?.vehiclePlateNumber,
                  originAddress: applicationData?.getCOVPermitById?.originAddress,
                  destinationAddress: applicationData?.getCOVPermitById?.destinationAddress
               }
            };
         default:
            return {};
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl">
            <DialogHeader>
               <DialogTitle>Upload Certificate</DialogTitle>
               <DialogDescription>
                  Generate and upload the certificate for {application.applicationNumber}
               </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
               {/* Left side - Certificate Preview */}
               <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold">Certificate Preview</h3>
                     <Button variant="outline" size="sm" onClick={handlePrint}>
                        <FileText className="w-4 h-4 mr-2" />
                        Print
                     </Button>
                  </div>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                     {showECertificate ? renderCertificateTemplate() : null}
                  </ScrollArea>
               </div>

               {/* Right side - Upload Form */}
               <div className="border rounded-lg p-4">
                  <div className="space-y-4">
                     <div>
                        <Label>Issue Date</Label>
                        <Input
                           type="date"
                           name="issueDate"
                           value={metadata.issueDate}
                           onChange={handleMetadataChange}
                        />
                     </div>
                     {application.applicationType === 'Certificate of Verification' && (
                        <div>
                           <Label>Expiry Date</Label>
                           <Input
                              type="date"
                              name="expiryDate"
                              value={metadata.expiryDate}
                              onChange={handleMetadataChange}
                           />
                        </div>
                     )}
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

                     <Separator />

                     <div>
                        <Label>Upload Scanned Certificate</Label>
                        <div className="mt-2">
                           <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                       <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                 </div>
                                 <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                 />
                              </label>
                           </div>
                        </div>

                        {certificateFile && (
                           <div className="mt-4 p-2 border rounded flex items-center justify-between">
                              <span className="text-sm truncate">{certificateFile.name}</span>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={handleRemoveFile}
                              >
                                 <X className="w-4 h-4" />
                              </Button>
                           </div>
                        )}
                     </div>

                     <div className="flex justify-between pt-4">
                        <Button
                           variant="outline"
                           onClick={() => setShowECertificate(!showECertificate)}
                        >
                           <Eye className="w-4 h-4 mr-2" />
                           {showECertificate ? 'Hide' : 'Show'} E-Certificate
                        </Button>
                        <Button
                           onClick={handleUpload}
                           disabled={isUploading}
                        >
                           {isUploading ? (
                              <>
                                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                 Uploading...
                              </>
                           ) : (
                              <>
                                 <Upload className="w-4 h-4 mr-2" />
                                 Upload Certificate
                              </>
                           )}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default UploadCertificateModal;
