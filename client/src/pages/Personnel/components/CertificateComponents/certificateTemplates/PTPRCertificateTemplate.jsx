import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import DENRLogo from '@/assets/denr-logo.png';
import BagongPilipinasLogo from '@/assets/BAGONG-PILIPINAS-LOGO.png';

const PTPRCertificateTemplate = forwardRef(({ certificate, application, orderOfPayment, hiddenOnPrint = [] }, ref) => {
   const certificateData = {
      ...application,
      lotArea: application?.otherDetails?.lotArea,
      treeSpecies: application?.otherDetails?.treeSpecies,
      totalTrees: application?.otherDetails?.totalTrees,
      treeSpacing: application?.otherDetails?.treeSpacing,
      yearPlanted: application?.otherDetails?.yearPlanted,
      contactNumber: application?.otherDetails?.contactNumber
   };

   console.log('PTPR Template Data:', {
      certificateData,
      certificate,
      orderOfPayment
   });

   const qrValue = JSON.stringify({
      certificateNumber: certificate.certificateNumber,
      ownerName: certificateData?.ownerName,
      lotArea: certificateData?.lotArea,
      totalTrees: certificateData?.totalTrees
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
               This is to certify that the Private Tree Plantation described below has been duly registered
               in accordance with existing DENR rules and regulations.
            </p>
         </div>

         <div className="mb-6">
            <p className="font-bold text-center mb-4">{certificateData?.ownerName}</p>
            <p className="text-center mb-4">(Name of Owner/Company)</p>
            <p className="text-center mb-4">{certificateData?.address}</p>
            <p className="text-center">(Address)</p>
         </div>

         <div className="mb-6">
            <p className="mb-2">Plantation Details:</p>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p><span className="font-bold">Lot Area:</span> {certificateData?.lotArea} hectares</p>
                  <p><span className="font-bold">Total Trees:</span> {certificateData?.totalTrees}</p>
                  <p><span className="font-bold">Tree Spacing:</span> {certificateData?.treeSpacing}</p>
               </div>
               <div>
                  <p><span className="font-bold">Year Planted:</span> {certificateData?.yearPlanted}</p>
                  <p><span className="font-bold">Tree Species:</span> {Array.isArray(certificateData?.treeSpecies) ? certificateData.treeSpecies.join(', ') : certificateData?.treeSpecies}</p>
                  <p><span className="font-bold">Contact Number:</span> {certificateData?.contactNumber}</p>
               </div>
            </div>
         </div>

         <div className="mb-6">
            <p className="mb-2">
               Issued on: {certificate.dateIssued ?
                  formatDate(certificate.dateIssued) :
                  '___________________'} at DENR-PENRO Marinduque
            </p>
         </div>

         <div className="mb-6">
            <p className="font-bold mb-4">APPROVED BY:</p>
            <div className="mt-12">
               <div className="signature-box text-center">
                  {certificate?.signature?.data && (
                     <div className="signature-line mb-2">
                        <img
                           src={`data:${certificate.signature.contentType};base64,${certificate.signature.data}`}
                           alt="PENR Officer Signature"
                           className="mx-auto h-16 object-contain"
                        />
                     </div>
                  )}
                  <p className="font-bold text-center">IMELDA M. DIAZ</p>
                  <p className="text-center">OIC-PENR Officer</p>
               </div>
            </div>
         </div>

         <div className="flex justify-end items-end">
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

PTPRCertificateTemplate.displayName = 'PTPRCertificateTemplate';

export default PTPRCertificateTemplate;
