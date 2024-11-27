import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useQuery, gql } from '@apollo/client';
import { Loader2 } from 'lucide-react';

const GET_CERTIFICATE = gql`
  query GetCertificatesByApplicationId($applicationId: ID!) {
    getCertificatesByApplicationId(applicationId: $applicationId) {
      id
      certificateNumber
      certificateStatus
      dateCreated
      dateIssued
      expiryDate
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
      signedBy {
        PENRO {
          signature
          dateSigned
        }
      }
    }
  }
`;

const CSAWCertificateViewModal = ({ isOpen, onClose, applicationId }) => {
   const { loading, error, data } = useQuery(GET_CERTIFICATE, {
      variables: { applicationId },
      skip: !applicationId
   });

   const formatDate = (dateString) => {
      if (!dateString) return 'Not set';
      try {
         let date;
         if (typeof dateString === 'string') {
            date = dateString.includes('T') ?
               new Date(dateString) :
               new Date(parseInt(dateString));
         } else {
            date = new Date(dateString);
         }

         if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString);
            return 'Not available';
         }
         return format(date, 'MMMM d, yyyy');
      } catch (error) {
         console.error('Error formatting date:', error, 'Date string:', dateString);
         return 'Not available';
      }
   };

   const getStatusBadgeClass = (status) => {
      switch (status) {
         case 'Pending Signature':
            return 'bg-yellow-100 text-yellow-800';
         case 'Complete Signatures':
            return 'bg-green-100 text-green-800';
         case 'Released':
            return 'bg-blue-100 text-blue-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   if (loading) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
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
         <Dialog open={isOpen} onOpenChange={onClose}>
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
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
               <div className="text-center p-6">
                  No certificate found for this application.
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Certificate Details</DialogTitle>
               <DialogDescription>
                  Certificate Number: {certificate.certificateNumber}
               </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-grow pr-4">
               <div className="space-y-4 pb-4">
                  <div className="flex justify-between items-center">
                     <div>
                        <h3 className="font-semibold text-sm text-gray-500">Registration Type</h3>
                        <p>{certificate.certificateData.registrationType}</p>
                     </div>
                     <Badge className={getStatusBadgeClass(certificate.certificateStatus)}>
                        {certificate.certificateStatus}
                     </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h3 className="font-semibold text-sm text-gray-500">Owner Information</h3>
                        <p className="font-medium">{certificate.certificateData.ownerName}</p>
                        <p className="text-sm text-gray-600">{certificate.certificateData.address}</p>
                     </div>
                     <div>
                        <h3 className="font-semibold text-sm text-gray-500">Important Dates</h3>
                        <div className="text-sm">
                           <p><span className="font-medium">Created:</span> {formatDate(certificate.dateCreated)}</p>
                           <p><span className="font-medium">Issued:</span> {formatDate(certificate.dateIssued)}</p>
                           <p><span className="font-medium">Expires:</span> {formatDate(certificate.expiryDate)}</p>
                        </div>
                     </div>
                  </div>

                  <Separator />

                  <div>
                     <h3 className="font-semibold text-sm text-gray-500 mb-2">Chainsaw Details</h3>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <p><span className="font-medium">Brand:</span> {certificate.certificateData.chainsawDetails.brand}</p>
                           <p><span className="font-medium">Model:</span> {certificate.certificateData.chainsawDetails.model}</p>
                           <p><span className="font-medium">Serial Number:</span> {certificate.certificateData.chainsawDetails.serialNumber}</p>
                           <p><span className="font-medium">Date of Acquisition:</span> {formatDate(certificate.certificateData.chainsawDetails.dateOfAcquisition)}</p>
                        </div>
                        <div>
                           <p><span className="font-medium">Power Output:</span> {certificate.certificateData.chainsawDetails.powerOutput}</p>
                           <p><span className="font-medium">Max Guide Bar Length:</span> {certificate.certificateData.chainsawDetails.maxLengthGuidebar}</p>
                           <p><span className="font-medium">Country of Origin:</span> {certificate.certificateData.chainsawDetails.countryOfOrigin}</p>
                           <p><span className="font-medium">Purchase Price:</span> ₱{certificate.certificateData.chainsawDetails.purchasePrice.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <Separator />

                  <div>
                     <h3 className="font-semibold text-sm text-gray-500">Purpose</h3>
                     <p className="text-sm">{certificate.certificateData.purpose}</p>
                  </div>

                  {certificate.signedBy?.PENRO && (
                     <>
                        <Separator />
                        <div>
                           <h3 className="font-semibold text-sm text-gray-500">Signature Information</h3>
                           <p className="text-sm">
                              <span className="font-medium">PENRO Signed:</span> {formatDate(certificate.signedBy.PENRO.dateSigned)}
                           </p>
                        </div>
                     </>
                  )}
               </div>
            </ScrollArea>

            <DialogFooter>
               <Button onClick={onClose}>Close</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default CSAWCertificateViewModal;
