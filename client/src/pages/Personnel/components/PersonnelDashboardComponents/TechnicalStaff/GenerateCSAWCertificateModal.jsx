import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, gql } from '@apollo/client';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import CSAWCertificateTemplate from './CSAWCertificateTemplate';
import { format } from 'date-fns';

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
        purpose
      }
    }
  }
`;

const FORWARD_CERTIFICATE = gql`
  mutation ForwardCertificateForSignature($id: ID!) {
    forwardCertificateForSignature(id: $id) {
      id
      certificateStatus
    }
  }
`;

const GenerateCSAWCertificateModal = ({ isOpen, onClose, application, onComplete }) => {
   const [showPreview, setShowPreview] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);
   const [certificate, setCertificate] = useState(null);
   const [permitDetails, setPermitDetails] = useState(null);
   const certificateRef = useRef();

   const { loading: permitLoading, error: permitError, data: permitData } = useQuery(GET_CSAW_PERMIT, {
      variables: { id: application?.id },
      skip: !application?.id
   });

   const [generateCertificate] = useMutation(GENERATE_CERTIFICATE);
   const [forwardCertificate] = useMutation(FORWARD_CERTIFICATE);

   useEffect(() => {
      if (permitData?.getCSAWPermitById) {
         console.log('Permit details received:', permitData.getCSAWPermitById);
         setPermitDetails(permitData.getCSAWPermitById);
      }
   }, [permitData]);

   const handlePrint = useReactToPrint({
      content: () => certificateRef.current,
   });

   const formatDate = (timestamp) => {
      try {
         const date = typeof timestamp === 'string' ?
            new Date(timestamp.includes('T') ? timestamp : parseInt(timestamp)) :
            new Date(timestamp);

         return format(date, 'yyyy-MM-dd');
      } catch (error) {
         console.error('Error formatting date:', error);
         return null;
      }
   };

   const handleGenerate = async () => {
      if (!permitDetails) {
         toast.error('Permit details not available');
         return;
      }

      console.log('Generating certificate with permit details:', {
         id: permitDetails._id || permitDetails.id,
         applicationType: permitDetails.applicationType,
         registrationType: permitDetails.registrationType,
         ownerName: permitDetails.ownerName,
         address: permitDetails.address,
         chainsawDetails: {
            brand: permitDetails.brand,
            model: permitDetails.model,
            serialNumber: permitDetails.serialNumber,
            dateOfAcquisition: permitDetails.dateOfAcquisition,
            powerOutput: permitDetails.powerOutput,
            maxLengthGuidebar: permitDetails.maxLengthGuidebar,
            countryOfOrigin: permitDetails.countryOfOrigin,
            purchasePrice: permitDetails.purchasePrice
         }
      });

      setIsGenerating(true);
      try {
         const acquisitionDate = formatDate(permitDetails.dateOfAcquisition);
         if (!acquisitionDate) {
            throw new Error('Invalid acquisition date');
         }

         const token = localStorage.getItem('token');
         const { data } = await generateCertificate({
            variables: {
               input: {
                  applicationId: permitDetails._id || permitDetails.id,
                  applicationType: permitDetails.applicationType,
                  certificateData: {
                     registrationType: permitDetails.registrationType,
                     ownerName: permitDetails.ownerName,
                     address: permitDetails.address,
                     chainsawDetails: {
                        brand: permitDetails.brand,
                        model: permitDetails.model,
                        serialNumber: permitDetails.serialNumber,
                        dateOfAcquisition: acquisitionDate,
                        powerOutput: permitDetails.powerOutput,
                        maxLengthGuidebar: permitDetails.maxLengthGuidebar,
                        countryOfOrigin: permitDetails.countryOfOrigin,
                        purchasePrice: parseFloat(permitDetails.purchasePrice)
                     },
                     purpose: "For Cutting/Slicing of Planted trees with cutting permits and coconut within Private Land"
                  }
               }
            },
            context: {
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Apollo-Require-Preflight': 'true'
               }
            }
         });

         console.log('Certificate generation response:', data);

         if (data.generateCertificate) {
            setCertificate(data.generateCertificate);
            setShowPreview(true);
            toast.success('Certificate generated successfully, the application will be forwarded to Chief RPS for signature');
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

   const handleOpenChange = (open) => {
      if (!open && showPreview) {
         return;
      }
      onClose();
   };

   if (permitLoading) return (
      <tr>
         <td colSpan="5" className="text-center py-4">
            Loading permit details...
         </td>
      </tr>
   );

   if (permitError) return (
      <tr>
         <td colSpan="5" className="text-center py-4 text-red-500">
            Error loading permit details
         </td>
      </tr>
   );

   if (showPreview) {
      return (
         <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl">
               <DialogHeader>
                  <DialogTitle>Chainsaw Registration Certificate Preview</DialogTitle>
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
                     className="bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                     Print
                  </Button>
                  <Button
                     onClick={handleForward}
                     className="bg-green-600 hover:bg-green-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                     Forward for Signature
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                     <p><span className="font-medium">Application Type:</span> {application.applicationType}</p>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={onClose}>
                  Cancel
               </Button>
               <Button
                  onClick={handleGenerate}
                  className="bg-green-600 hover:bg-green-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={isGenerating}
               >
                  {isGenerating ? 'Generating...' : 'Generate Certificate'}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default GenerateCSAWCertificateModal;
