import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import CSAWCertificateTemplate from './CSAWCertificateTemplate';
import { format } from 'date-fns';

const GENERATE_CERTIFICATE = gql`
  mutation GenerateCertificate($input: GenerateCertificateInput!) {
    generateCertificate(input: $input) {
      id
      certificateNumber
      status
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
    }
  }
`;

const FORWARD_CERTIFICATE = gql`
  mutation ForwardCertificateForSignature($id: ID!) {
    forwardCertificateForSignature(id: $id) {
      id
      status
    }
  }
`;

const GenerateCertificateModal = ({ isOpen, onClose, application, onComplete }) => {
   const [showPreview, setShowPreview] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);
   const [certificate, setCertificate] = useState(null);
   const certificateRef = useRef();

   const [generateCertificate] = useMutation(GENERATE_CERTIFICATE);
   const [forwardCertificate] = useMutation(FORWARD_CERTIFICATE);

   const handlePrint = useReactToPrint({
      content: () => certificateRef.current,
   });

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const handleGenerate = async () => {
      setIsGenerating(true);
      try {
         console.log('Application data:', {
            id: application.id,
            applicationType: application.applicationType,
            registrationType: application.registrationType,
            ownerName: application.ownerName,
            address: application.address,
            brand: application.brand,
            model: application.model,
            serialNumber: application.serialNumber,
            dateOfAcquisition: application.dateOfAcquisition,
            powerOutput: application.powerOutput,
            maxLengthGuidebar: application.maxLengthGuidebar,
            countryOfOrigin: application.countryOfOrigin,
            purchasePrice: application.purchasePrice
         });

         const { data } = await generateCertificate({
            variables: {
               input: {
                  applicationId: application.id,
                  applicationType: application.applicationType,
                  certificateData: {
                     registrationType: application.registrationType,
                     ownerName: application.ownerName,
                     address: application.address,
                     chainsawDetails: {
                        brand: application.brand,
                        model: application.model,
                        serialNumber: application.serialNumber,
                        dateOfAcquisition: new Date(parseInt(application.dateOfAcquisition)).toISOString(),
                        powerOutput: application.powerOutput,
                        maxLengthGuidebar: application.maxLengthGuidebar,
                        countryOfOrigin: application.countryOfOrigin,
                        purchasePrice: parseFloat(application.purchasePrice)
                     },
                     purpose: "For Cutting/Slicing of Planted trees with cutting permits and coconut within Private Land"
                  }
               }
            }
         });

         console.log('Generate certificate response:', data);

         if (data.generateCertificate) {
            setCertificate(data.generateCertificate);
            setShowPreview(true);
            toast.success('Certificate generated successfully');
         }
      } catch (error) {
         console.error('Error generating certificate:', error);
         toast.error(`Failed to generate certificate: ${error.message}`);
      } finally {
         setIsGenerating(false);
      }
   };

   const handleForward = async () => {
      try {
         await forwardCertificate({
            variables: {
               id: certificate.id
            }
         });
         toast.success('Certificate forwarded for signature');
         onComplete();
         onClose();
      } catch (error) {
         console.error('Error forwarding certificate:', error);
         toast.error(`Failed to forward certificate: ${error.message}`);
      }
   };

   if (showPreview) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
               <DialogHeader>
                  <DialogTitle>Certificate Previeww</DialogTitle>
                  <DialogDescription>
                     Review the generated certificate before forwarding for signature.
                  </DialogDescription>
               </DialogHeader>
               <div className="overflow-auto max-h-[70vh]">
                  <CSAWCertificateTemplate
                     ref={certificateRef}
                     certificate={certificate}
                     application={application}
                  />
               </div>
               <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={onClose}>
                     Cancel
                  </Button>
                  <Button
                     onClick={handlePrint}
                     className="bg-blue-600 hover:bg-blue-700"
                  >
                     Print
                  </Button>
                  <Button
                     onClick={handleForward}
                     className="bg-green-600 hover:bg-green-700"
                  >
                     Forward for Signature
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Generate Certificate</DialogTitle>
               <DialogDescription>
                  Generate a certificate for the chainsaw registration application.
               </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                  <Label>Application Details</Label>
                  <div className="text-sm">
                     <p><span className="font-medium">Application No:</span> {application.applicationNumber}</p>
                     <p><span className="font-medium">Owner:</span> {application.ownerName}</p>
                     <p><span className="font-medium">Chainsaw:</span> {application.brand} {application.model}</p>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={onClose}>
                  Cancel
               </Button>
               <Button
                  onClick={handleGenerate}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isGenerating}
               >
                  {isGenerating ? 'Generating...' : 'Generate Certificate'}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default GenerateCertificateModal;
