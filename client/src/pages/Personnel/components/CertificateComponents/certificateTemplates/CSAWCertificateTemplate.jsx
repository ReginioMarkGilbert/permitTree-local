import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import DENRLogo from '@/assets/denr-logo.png';
import BagongPilipinasLogo from '@/assets/BAGONG-PILIPINAS-LOGO.png';
import { gql, useQuery } from '@apollo/client';

const CSAWCertificateTemplate = forwardRef(({ certificate, application, hiddenOnPrint = [] }, ref) => {
   const qrValue = JSON.stringify({
      certificateNumber: certificate.certificateNumber,
      applicationNumber: application.applicationNumber,
      ownerName: certificate.certificateData.ownerName,
      serialNumber: certificate.certificateData.chainsawDetails.serialNumber
   });
   // correct way to format date in certificate template
   // format date string
   const formatDate = (timestamp) => {
      try {
         if (!timestamp) return null;

         // Handle string timestamps
         if (typeof timestamp === 'string') {
            // Check if it's a numeric string (Unix timestamp)
            if (!isNaN(timestamp)) {
               return format(new Date(parseInt(timestamp)), 'MMMM d, yyyy');
            }
            // If it's an ISO string or other date string
            return format(new Date(timestamp), 'MMMM d, yyyy');
         }

         // Handle numeric timestamps
         if (typeof timestamp === 'number') {
            return format(new Date(timestamp), 'MMMM d, yyyy');
         }

         // Handle Date objects
         if (timestamp instanceof Date) {
            return format(timestamp, 'MMMM d, yyyy');
         }

         return null;
      } catch (error) {
         console.error('Error formatting date:', error, 'timestamp:', timestamp);
         return null;
      }
   };

   // Update the query to include OOP information
   const GET_CERTIFICATE_DETAILS = gql`
     query GetCertificateDetails($id: ID!) {
       getCertificateById(id: $id) {
         id
         certificateNumber
         certificateStatus
         dateCreated
         dateIssued
         expiryDate
         applicationId
         orderOfPayment @include(if: true) {
           id
           OOPstatus
           officialReceipt {
             orNumber
             dateIssued
             amount
             paymentMethod
           }
         }
       }
     }
   `;

   // Use the query if needed
   const { data: certData, loading: certLoading } = useQuery(GET_CERTIFICATE_DETAILS, {
      variables: { id: certificate.id },
      skip: !certificate?.id,
      onCompleted: (data) => {
         console.log('Certificate with OOP data:', data);
      }
   });

   return (
      <div ref={ref} className="p-8 bg-white">
         <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
               <img src={DENRLogo} alt="DENR Logo" className="h-20" />
               <div>
                  <h1 className="text-xl font-bold">CERTIFICATE OF REGISTRATION</h1>
                  <p className="text-sm">Department of Environment and Natural Resources</p>
                  <p className="text-sm">PENRO Marinduque</p>
               </div>
               <img src={BagongPilipinasLogo} alt="GovPH Logo" className="h-20" />
            </div>
            <p className="text-sm">No. {certificate.certificateNumber}</p>
         </div>

         <div className="mb-6">
            <p className="text-justify mb-4">
               After having complied with the provisions of DENR Administrative Order No. 2003-24, Series of 2003
               otherwise known as "The Implementing Rules and Regulations of the Chainsaw Act of 2002 (RA No. 9175)"
               entitled "AN ACT REGULATING THE OWNERSHIP, POSSESSION, SALE, IMPORTATION AND USE OF CHAINSAWS
               PENALIZING VIOLATIONS THEREOF AND FOR OTHER PURPOSES" this Certificate of Registration to own,
               possess and/or use a chainsaw is hereby issued to:
            </p>
         </div>

         <div className="mb-6">
            <p className="font-bold text-center mb-4">{certificate.certificateData.ownerName}</p>
            <p className="text-center mb-4">(Name of Owner)</p>
            <p className="text-center mb-4">{certificate.certificateData.address}</p>
            <p className="text-center">(Address)</p>
         </div>

         <div className="mb-6">
            <p className="mb-2">Bearing the following information and descriptions:</p>
            <p className="mb-2">
               <span className="font-bold">Use of the Chainsaw:</span> {certificate.certificateData.purpose}
            </p>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p><span className="font-bold">Brand:</span> {certificate.certificateData.chainsawDetails.brand}</p>
                  <p><span className="font-bold">Model:</span> {certificate.certificateData.chainsawDetails.model}</p>
                  <p><span className="font-bold">Serial No:</span> {certificate.certificateData.chainsawDetails.serialNumber}</p>
                  <p>
                     <span className="font-bold">Date of Acquisition:</span> {
                        formatDate(certificate.certificateData.chainsawDetails.dateOfAcquisition)
                     }
                  </p>
               </div>
               <div>
                  <p><span className="font-bold">Power Output:</span> {certificate.certificateData.chainsawDetails.powerOutput}</p>
                  <p><span className="font-bold">Maximum Length of Guidebar:</span> {certificate.certificateData.chainsawDetails.maxLengthGuidebar}</p>
                  <p><span className="font-bold">Country of Origin:</span> {certificate.certificateData.chainsawDetails.countryOfOrigin}</p>
                  <p><span className="font-bold">Purchase Price:</span> ₱{certificate.certificateData.chainsawDetails.purchasePrice.toFixed(2)}</p>
               </div>
            </div>
         </div>

         <div className="mb-6">
            <p className="mb-2">
               Issued on: {formatDate(certificate.dateIssued) || '___________________'} at DENR-PENRO Marinduque
            </p>
            <p>
               Expiry Date: {formatDate(certificate.expiryDate) || '_____________________'}
            </p>
         </div>

         <div className="mb-6">
            <p className="font-bold mb-4">APPROVED BY:</p>
            <div className="mt-12">
               <p className="font-bold text-center">IMELDA M. DIAZ</p>
               <p className="text-center">OIC-PENR Officer</p>
            </div>
         </div>

         <div className="flex justify-between items-end">
            <div>
               <p>Amount paid: Php {certData?.getCertificateById?.orderOfPayment?.officialReceipt?.amount?.toFixed(2) || '500.00'}</p>
               <p>O.R. No.: {certData?.getCertificateById?.orderOfPayment?.officialReceipt?.orNumber || '_______________'}</p>
               <p>Date: {certData?.getCertificateById?.orderOfPayment?.officialReceipt?.dateIssued ?
                  formatDate(certData.getCertificateById.orderOfPayment.officialReceipt.dateIssued) :
                  '_________________'}</p>
            </div>
            <div className={`qr-code ${hiddenOnPrint.includes('qr-code') ? 'no-print' : ''}`}>
               <QRCode
                  value={qrValue}
                  size={100}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 100 100`}
               />
               <p className="text-xs mt-2">Scan to verify</p>
            </div>
         </div>

         <div className="mt-8 text-xs text-center">
            <p>***Not valid w/o PENRO Official Seal***</p>
            <p className="mt-4">
               Capitol Compound, Barangay Bangbangalon, Boac, Marinduque<br />
               Telephone Nos.: (042) 332-1490/0917-552-6811 VOIP: 2305<br />
               Website: https://penromarinduque.gov.ph<br />
               Email: penromarinduque@denr.gov.ph
            </p>
         </div>
      </div>
   );
});

CSAWCertificateTemplate.displayName = 'CSAWCertificateTemplate';

export default CSAWCertificateTemplate;
