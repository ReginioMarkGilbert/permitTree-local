import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import DENRLogo from '@/assets/denr-logo.png';
import BagongPilipinasLogo from '@/assets/BAGONG-PILIPINAS-LOGO.png';

const CSAWCertificateTemplate = forwardRef(({ certificate, application, orderOfPayment, hiddenOnPrint = [] }, ref) => {
   const certificateData = application;

   const qrValue = JSON.stringify({
      certificateNumber: certificate.certificateNumber,
      ownerName: certificateData?.ownerName,
      serialNumber: certificateData?.chainsawDetails?.serialNumber
   });

   const formatDate = (timestamp) => {
      try {
         if (!timestamp) return null;

         if (typeof timestamp === 'string') {
            if (!isNaN(timestamp)) {
               return format(new Date(parseInt(timestamp)), 'MMMM d, yyyy');
            }
            return format(new Date(timestamp), 'MMMM d, yyyy');
         }

         if (typeof timestamp === 'number') {
            return format(new Date(timestamp), 'MMMM d, yyyy');
         }

         if (timestamp instanceof Date) {
            return format(timestamp, 'MMMM d, yyyy');
         }

         return null;
      } catch (error) {
         console.error('Error formatting date:', error, 'timestamp:', timestamp);
         return null;
      }
   };

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
            <p className="font-bold text-center mb-4">{certificateData?.ownerName}</p>
            <p className="text-center mb-4">(Name of Owner)</p>
            <p className="text-center mb-4">{certificateData?.address}</p>
            <p className="text-center">(Address)</p>
         </div>

         <div className="mb-6">
            <p className="mb-2">Bearing the following information and descriptions:</p>
            <p className="mb-2">
               <span className="font-bold">Use of the Chainsaw:</span> {certificateData?.purpose}
            </p>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p><span className="font-bold">Brand:</span> {certificateData?.chainsawDetails?.brand}</p>
                  <p><span className="font-bold">Model:</span> {certificateData?.chainsawDetails?.model}</p>
                  <p><span className="font-bold">Serial No:</span> {certificateData?.chainsawDetails?.serialNumber}</p>
                  <p><span className="font-bold">Date of Acquisition:</span> {formatDate(certificateData?.chainsawDetails?.dateOfAcquisition)}</p>
               </div>
               <div>
                  <p><span className="font-bold">Power Output:</span> {certificateData?.chainsawDetails?.powerOutput}</p>
                  <p><span className="font-bold">Maximum Length of Guidebar:</span> {certificateData?.chainsawDetails?.maxLengthGuidebar}</p>
                  <p><span className="font-bold">Country of Origin:</span> {certificateData?.chainsawDetails?.countryOfOrigin}</p>
                  <p><span className="font-bold">Purchase Price:</span> ₱{
                     typeof certificateData?.chainsawDetails?.purchasePrice === 'number'
                        ? certificateData.chainsawDetails.purchasePrice.toFixed(2)
                        : '0.00'
                  }</p>
               </div>
            </div>
         </div>

         <div className="mb-6">
            <p className="mb-2">
               Issued on: {certificate.dateIssued ?
                  formatDate(certificate.dateIssued) :
                  '___________________'} at DENR-PENRO Marinduque
            </p>
            <p>
               Expiry Date: {certificate.expiryDate ?
                  formatDate(certificate.expiryDate) :
                  '_____________________'}
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
               <p>Amount paid: Php {orderOfPayment?.officialReceipt?.amount?.toFixed(2) || '500.00'}</p>
               <p>O.R. No.: {orderOfPayment?.officialReceipt?.orNumber || '_______________'}</p>
               <p>Date: {orderOfPayment?.officialReceipt?.dateIssued ?
                  formatDate(orderOfPayment.officialReceipt.dateIssued) :
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