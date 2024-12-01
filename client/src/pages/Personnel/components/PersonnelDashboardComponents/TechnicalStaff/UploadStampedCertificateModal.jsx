import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';

const UPLOAD_STAMPED_CERTIFICATE = gql`
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

const UploadStampedCertificateModal = ({ isOpen, onClose, application, onComplete }) => {
   const [isUploading, setIsUploading] = useState(false);
   const [certificateFile, setCertificateFile] = useState(null);
   const [metadata, setMetadata] = useState({
      issueDate: '',
      expiryDate: '',
      remarks: ''
   });

   const [uploadCertificate] = useMutation(UPLOAD_STAMPED_CERTIFICATE);

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

   const handleUpload = async () => {
      if (!certificateFile) {
         toast.error('Please select a stamped certificate file to upload');
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
                        certificateType: application.applicationType,
                        issueDate: new Date().toISOString(),
                        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        remarks: metadata.remarks || ''
                     }
                  }
               }
            }
         });

         if (data?.uploadCertificate) {
            toast.success('Stamped certificate uploaded successfully');
            onComplete(data.uploadCertificate);
            onClose();
         } else {
            throw new Error('Failed to upload stamped certificate');
         }
      } catch (error) {
         console.error('Error uploading stamped certificate:', error);
         toast.error(error.message || 'Failed to upload stamped certificate');
      } finally {
         setIsUploading(false);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Upload Stamped Certificate</DialogTitle>
               <DialogDescription>
                  Upload the stamped physical certificate for {application.applicationType}.
                  This will replace the previously uploaded certificate.
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
                  <Label>Upload Stamped Certificate</Label>
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
                        {certificateFile ? 'Change Certificate' : 'Upload Stamped Certificate'}
                     </Label>
                  </div>
                  <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
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
                  {isUploading ? 'Uploading...' : 'Upload Stamped Certificate'}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default UploadStampedCertificateModal;
