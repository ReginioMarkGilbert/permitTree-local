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
      if (!generatedCertificate) return null;

      const certificateData = {
         ...generatedCertificate,
         certificateData: {
            ...generatedCertificate.certificateData,
            ownerName: application.ownerName,
            address: application.address,
            purpose: "For Cutting/Slicing of Planted trees with cutting permits and coconut within Private Land",
            chainsawDetails: {
               brand: application.brand,
               model: application.model,
               serialNumber: application.serialNumber,
               dateOfAcquisition: application.dateOfAcquisition,
               powerOutput: application.powerOutput,
               maxLengthGuidebar: application.maxLengthGuidebar,
               countryOfOrigin: application.countryOfOrigin,
               purchasePrice: parseFloat(application.purchasePrice)
            }
         }
      };

      switch (application.applicationType) {
         case 'Chainsaw Registration':
            return (
               <div style={{ display: 'none' }}>
                  <CSAWCertificateTemplate
                     ref={certificateRef}
                     certificate={certificateData}
                     application={certificateData.certificateData}
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

                  {/* <ScrollArea className="h-[700px] rounded-md border"> */}
                  <div className="overflow-auto max-h-[70vh]">
                     <CSAWCertificateTemplate
                        certificate={generatedCertificate}
                        application={generatedCertificate.certificateData}
                        hiddenOnPrint={[]}
                     />
                  </div>
                  {/* </ScrollArea> */}

                  <div className="flex justify-end gap-2">
                     <Button variant="outline" onClick={() => setShowECertificate(false)}>
                        Back
                     </Button>
                     {/* remove this later if not implemented */}
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
                                 onClick={handleViewECertificate}
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
