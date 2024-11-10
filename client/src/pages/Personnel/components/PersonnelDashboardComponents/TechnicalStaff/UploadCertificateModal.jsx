import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import FileUploader from '@/components/ui/file-uploader';

const UPLOAD_CERTIFICATE = gql`
  mutation UploadCertificate($input: UploadCertificateInput!) {
    uploadCertificate(input: $input) {
      id
      certificateNumber
      status
      dateCreated
      uploadedCertificate {
        fileUrl
        uploadDate
        metadata {
          certificateType
          issueDate
          expiryDate
        }
      }
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

   const [uploadCertificate] = useMutation(UPLOAD_CERTIFICATE);

   const handleFileChange = (file) => {
      setCertificateFile(file);
   };

   const handleMetadataChange = (e) => {
      const { name, value } = e.target;
      setMetadata(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleUpload = async () => {
      if (!certificateFile) {
         toast.error('Please select a certificate file to upload');
         return;
      }

      setIsUploading(true);
      try {
         // TODO: Implement file upload to storage service
         const fileUrl = 'temporary-url'; // Replace with actual upload logic

         const { data } = await uploadCertificate({
            variables: {
               input: {
                  applicationId: application.id,
                  applicationType: application.applicationType,
                  fileUrl,
                  metadata: {
                     ...metadata,
                     certificateType: application.applicationType
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

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
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
                  <Label>Certificate File</Label>
                  <FileUploader
                     accept=".pdf,.doc,.docx"
                     maxSize={5242880} // 5MB
                     onFileSelect={handleFileChange}
                  />
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
         </DialogContent>
      </Dialog>
   );
};

export default UploadCertificateModal;
