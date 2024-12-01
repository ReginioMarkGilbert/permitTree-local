import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { Loader2, UploadIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const SIGN_CERTIFICATE = gql`
  mutation SignCertificate($id: ID!, $signature: String!, $expiryDate: String!) {
    signCertificate(id: $id, signature: $signature, expiryDate: $expiryDate) {
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
   const [expiryDate, setExpiryDate] = useState('');

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

      if (!expiryDate) {
         toast.error('Please set the certificate expiry date');
         return;
      }

      try {
         setIsSubmitting(true);

         const { data: signData } = await signCertificate({
            variables: {
               id: application.certificateId,
               signature: signature,
               expiryDate: new Date(expiryDate).toISOString()
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

               <div className="grid gap-2">
                  <Label>Certificate Expiry Date</Label>
                  <Input
                     type="date"
                     value={expiryDate}
                     onChange={(e) => setExpiryDate(e.target.value)}
                     min={new Date().toISOString().split('T')[0]}
                     required
                  />
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
