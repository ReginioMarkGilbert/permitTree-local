import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuery, gql } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import CSAWCertificateTemplate from '../PersonnelDashboardComponents/TechnicalStaff/CSAWCertificateTemplate';
import { useNavigate } from 'react-router-dom';

const GET_CERTIFICATE = gql`
  query GetCertificatesByApplicationId($applicationId: ID!) {
    getCertificatesByApplicationId(applicationId: $applicationId) {
      id
      certificateNumber
      certificateStatus
      dateCreated
      dateIssued
      expiryDate
      applicationId
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

const CSAWCertificateViewModal = ({ isOpen, onClose, applicationId }) => {
   const certificateRef = useRef();
   const { loading, error, data } = useQuery(GET_CERTIFICATE, {
      variables: { applicationId },
      skip: !applicationId
   });

   const { data: applicationData } = useQuery(gql`
      query GetCSAWPermit($id: ID!) {
         getCSAWPermitById(id: $id) {
            id
            applicationNumber
            applicationType
            status
            currentStage
         }
      }
   `, {
      variables: { id: applicationId },
      skip: !applicationId
   });

   const navigate = useNavigate();

   const handlePrint = () => {
      navigate('/personnel/csaw-certificate-print', {
         state: {
            certificate: data?.getCertificatesByApplicationId[0],
            application: applicationData?.getCSAWPermitById
         }
      });
   };

   // Add this function to handle dialog close attempts
   const handleOpenChange = (open) => {
      if (!open) {
         onClose();
      }
   };

   if (loading) {
      return (
         <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
               <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   if (error) {
      return (
         <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
               <div className="text-red-500 p-6">
                  Error loading certificate details: {error.message}
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   const certificate = data?.getCertificatesByApplicationId[0];
   if (!certificate) {
      return (
         <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
               <div className="text-center p-6">
                  No certificate found for this application.
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
         <DialogContent className="max-w-4xl">
            <DialogHeader>
               <DialogTitle>Chainsaw Registration Certificate</DialogTitle>
               <DialogDescription>
                  Certificate Number: {certificate.certificateNumber}
               </DialogDescription>
            </DialogHeader>

            <div className="overflow-auto max-h-[70vh]">
               <CSAWCertificateTemplate
                  ref={certificateRef}
                  certificate={certificate}
                  application={applicationData?.getCSAWPermitById}
               />
            </div>

            <DialogFooter className="flex justify-end gap-2 mt-4">
               <Button variant="outline" onClick={onClose}>
                  Close
               </Button>
               <Button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
               >
                  Print
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default CSAWCertificateViewModal;
