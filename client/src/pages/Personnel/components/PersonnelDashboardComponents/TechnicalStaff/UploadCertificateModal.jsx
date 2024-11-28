import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation, gql, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import CSAWCertificateTemplate from '../../CertificateComponents/certificateTemplates/CSAWCertificateTemplate';

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

   const [uploadCertificate] = useMutation(UPLOAD_CERTIFICATE);
   const [generateCertificateMutation] = useMutation(GENERATE_CERTIFICATE);

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

      setIsUploading(true);
      try {
         const fileData = await fileToBase64(certificateFile);

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
                        ...metadata,
                        certificateType: application.applicationType
                     }
                  }
               }
            }
         });

         toast.success('Certificate uploaded successfully');
         onComplete(data.uploadCertificate);
         onClose();
      } catch (error) {
         console.error('Error uploading certificate:', error);
         toast.error('Failed to upload certificate');
      } finally {
         setIsUploading(false);
      }
   };

   const generateECertificate = async () => {
      if (applicationLoading) {
         toast.error('Loading application details...');
         return;
      }

      const fullApplication = applicationData?.getCSAWPermitById;
      if (!fullApplication) {
         toast.error('Application details not found');
         return;
      }

      try {
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
      }
   };

   const handleViewECertificate = () => {
      setShowECertificate(true);
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
                     application={application}
                  />
               </div>
            );
         // Add other cases for different permit types here
         default:
            return null;
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl">
            {showECertificate ? (
               <>
                  <DialogHeader>
                     <DialogTitle>E-Certificate Preview</DialogTitle>
                     <DialogDescription>
                        Review the generated certificate
                     </DialogDescription>
                  </DialogHeader>
                  <div className="overflow-auto max-h-[70vh]">
                     <CSAWCertificateTemplate
                        certificate={generatedCertificate}
                        application={application}
                     />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                     <Button variant="outline" onClick={() => setShowECertificate(false)}>
                        Back to Upload
                     </Button>
                     <Button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700"
                     >
                        Print
                     </Button>
                  </div>
               </>
            ) : (
               <>
                  <DialogHeader>
                     <DialogTitle>Upload Certificate</DialogTitle>
                     <DialogDescription>
                        Upload the certificate document for {application.applicationType}
                     </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                        <Label>Application Details</Label>
                        <div className="text-sm">
                           <p><span className="font-medium">Application No:</span> {application.applicationNumber}</p>
                           <p><span className="font-medium">Type:</span> {application.applicationType}</p>
                           <p><span className="font-medium">Applicant:</span> {application.ownerName}</p>
                        </div>
                     </div>

                     <div className="grid gap-2">
                        <Label>E-Certificate Generation</Label>
                        <div className="flex gap-2">
                           <Button
                              onClick={generateECertificate}
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={generatedCertificate !== null}
                           >
                              Generate E-Certificate
                           </Button>
                           {generatedCertificate && (
                              <Button
                                 onClick={handleViewECertificate}
                                 className="bg-purple-600 hover:bg-purple-700"
                              >
                                 View E-Certificate
                              </Button>
                           )}
                        </div>
                     </div>

                     <div className="grid gap-2">
                        <Label>Upload Physical Certificate</Label>
                        {certificateFile && (
                           <div className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
                              <span className="text-sm text-gray-600 truncate">{certificateFile.name}</span>
                              <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={handleRemoveFile}
                              >
                                 <X className="h-4 w-4" />
                              </Button>
                           </div>
                        )}
                        <div className="flex items-center">
                           <Input
                              id="certificate-file"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                           />
                           <Label
                              htmlFor="certificate-file"
                              className="cursor-pointer flex items-center justify-center w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                           >
                              <Upload className="mr-2 h-4 w-4" />
                              {certificateFile ? 'Change Certificate' : 'Upload Certificate'}
                           </Label>
                        </div>
                        <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
                     </div>

                     <div className="grid gap-2">
                        <Label>Issue Date</Label>
                        <Input
                           type="date"
                           name="issueDate"
                           value={metadata.issueDate}
                           onChange={handleMetadataChange}
                        />
                     </div>

                     <div className="grid gap-2">
                        <Label>Expiry Date</Label>
                        <Input
                           type="date"
                           name="expiryDate"
                           value={metadata.expiryDate}
                           onChange={handleMetadataChange}
                        />
                     </div>

                     <div className="grid gap-2">
                        <Label>Remarks (Optional)</Label>
                        <Input
                           type="text"
                           name="remarks"
                           value={metadata.remarks}
                           onChange={handleMetadataChange}
                           placeholder="Add any additional remarks..."
                        />
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
                        {isUploading ? 'Uploading...' : 'Upload Certificate'}
                     </Button>
                  </div>
               </>
            )}
         </DialogContent>
      </Dialog>
   );
};

export default UploadCertificateModal;
