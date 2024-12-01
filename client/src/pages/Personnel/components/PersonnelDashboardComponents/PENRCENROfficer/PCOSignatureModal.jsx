import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { Loader2, UploadIcon, X } from 'lucide-react';

const SIGN_CERTIFICATE = gql`
  mutation SignCertificate($id: ID!, $signature: String!) {
    signCertificate(id: $id, signature: $signature) {
      id
      certificateStatus
      dateIssued
      expiryDate
      signature {
        data
        contentType
      }
    }
  }
`;

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!
    $currentStage: String!
    $status: String!
    $certificateSignedByPENRCENROfficer: Boolean!
  ) {
    updatePermitStage(
      id: $id
      currentStage: $currentStage
      status: $status
      certificateSignedByPENRCENROfficer: $certificateSignedByPENRCENROfficer
    ) {
      id
      currentStage
      status
      certificateSignedByPENRCENROfficer
    }
  }
`;

const PCOSignatureModal = ({ isOpen, onClose, application, onSignComplete }) => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [signCertificate] = useMutation(SIGN_CERTIFICATE);
   const [updatePermitStage] = useMutation(UPDATE_PERMIT_STAGE);
   const [signature, setSignature] = useState(null);
   const fileInputRef = useRef(null);

   useEffect(() => {
      console.log('Application prop in signature modal:', application);
   }, [application]);

   const handleSignatureUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            setSignature(e.target.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const triggerFileInput = (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current.click();
   };

   const handleRemoveSignature = () => {
      setSignature(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   const handleSign = async () => {
      if (!signature) {
         toast.error('Please upload your signature first');
         return;
      }

      try {
         setIsSubmitting(true);

         // Log for debugging
         console.log('Signing certificate with ID:', application.certificateId);
         console.log('Signature data:', signature);

         // Check if we have the certificate ID
         if (!application.certificateId && application.id) {
            // Try to get certificate ID from the application ID
            const certResponse = await client.query({
               query: GET_CERTIFICATE,
               variables: { applicationId: application.id }
            });

            const certificateId = certResponse.data?.getCertificatesByApplicationId[0]?.id;
            if (!certificateId) {
               throw new Error('No certificate found for this application');
            }

            // Sign the certificate with signature
            const { data: signData } = await signCertificate({
               variables: {
                  id: certificateId,
                  signature: signature
               }
            });

            console.log('Sign certificate response:', signData);

            // Update permit stage only if signature was successful
            if (signData?.signCertificate) {
               await updatePermitStage({
                  variables: {
                     id: application.id,
                     currentStage: 'PendingRelease',
                     status: 'In Progress',
                     certificateSignedByPENRCENROfficer: true
                  }
               });

               toast.success('Certificate signed successfully');
               onSignComplete();
               onClose();
            }
         } else if (application.certificateId) {
            // Use the existing certificateId
            const { data: signData } = await signCertificate({
               variables: {
                  id: application.certificateId,
                  signature: signature
               }
            });

            console.log('Sign certificate response:', signData);

            // Update permit stage only if signature was successful
            if (signData?.signCertificate) {
               await updatePermitStage({
                  variables: {
                     id: application.id,
                     currentStage: 'PendingRelease',
                     status: 'In Progress',
                     certificateSignedByPENRCENROfficer: true
                  }
               });

               toast.success('Certificate signed successfully');
               onSignComplete();
               onClose();
            }
         } else {
            throw new Error('No certificate ID found');
         }
      } catch (error) {
         console.error('Error signing certificate:', error);
         toast.error('Failed to sign certificate: ' + error.message);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Sign Certificate</DialogTitle>
               <DialogDescription>
                  You are about to sign the certificate for application {application?.applicationNumber}.
                  Please upload your signature to proceed.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm font-medium">Certificate Details:</p>
                  <ul className="mt-2 space-y-2 text-sm">
                     <li>Application Number: {application?.applicationNumber}</li>
                     <li>Application Type: {application?.applicationType}</li>
                     <li>Status: {application?.status}</li>
                  </ul>
               </div>

               <div className="text-center">
                  <div className="relative h-32 mb-4 border-2 border-dashed rounded-md flex items-center justify-center bg-accent/50">
                     {signature ? (
                        <>
                           <img
                              src={signature}
                              alt="PENR/CENR Officer Signature"
                              className="max-w-full max-h-full object-contain"
                           />
                           <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                              onClick={handleRemoveSignature}
                           >
                              <X className="h-4 w-4 text-red-600" />
                           </Button>
                        </>
                     ) : (
                        <p className="text-muted-foreground">PENR/CENR Officer Signature</p>
                     )}
                  </div>
                  <p className="font-semibold text-foreground">IMELDA M. DIAZ</p>
                  <p className="text-xs text-muted-foreground">OIC-PENR Officer</p>
                  <input
                     type="file"
                     ref={fileInputRef}
                     className="hidden"
                     accept="image/*"
                     onChange={handleSignatureUpload}
                  />
                  <Button
                     variant="outline"
                     size="sm"
                     className="mt-2"
                     onClick={triggerFileInput}
                  >
                     <UploadIcon className="h-4 w-4 mr-2" />
                     Upload Signature
                  </Button>
               </div>
            </div>

            <DialogFooter>
               <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
               >
                  Cancel
               </Button>
               <Button
                  onClick={handleSign}
                  disabled={isSubmitting || !signature}
                  className="bg-green-600 text-white hover:bg-green-700"
               >
                  {isSubmitting ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                     </>
                  ) : (
                     'Sign Certificate'
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default PCOSignatureModal;
