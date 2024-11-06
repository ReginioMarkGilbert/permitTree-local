import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import denrLogo from "@/assets/denr-logo.png";

const OOPPrintPage = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const oop = location.state?.oop;

   useEffect(() => {
      if (!oop) {
         navigate('/user/applications');
         return;
      }

      // Auto-print when component mounts
      window.print();
   }, [oop, navigate]);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   if (!oop) return null;

   return (
      <div className="print-page">
         {/* Header */}
         <div className="text-center mb-4">
            <img src={denrLogo} alt="DENR Logo" className="mx-auto w-16 mb-2" />
            <p>Republic of the Philippines</p>
            <p>Department of Environment and Natural Resources</p>
            <p>PENRO Marinduque</p>
         </div>

         <h1 className="text-center font-bold mb-4">Assessment of Fees and Charges</h1>

         {/* Bill Info */}
         <div className="text-right mb-4">
            <p>Bill No.: {oop.billNo}</p>
            <p>Date: {formatDate(oop.createdAt)}</p>
         </div>

         {/* Form Fields */}
         <div className="mb-4">
            <div className="mb-2">
               <span>Name/Payee: </span>
               <span>{oop.namePayee}</span>
            </div>
            <div className="mb-2">
               <span>Address: </span>
               <span>{oop.address}</span>
            </div>
            <div className="mb-2">
               <span>Nature of Application/Permit/Documents being secured:</span>
               <div>{oop.natureOfApplication}</div>
            </div>
         </div>

         {/* Fees Table */}
         <table className="w-full border-collapse border border-black mb-8">
            <thead>
               <tr>
                  <th className="border border-black p-2 text-left">Legal Basis (DAO/SEC)</th>
                  <th className="border border-black p-2 text-left">Description and Computation of Fees and Charges</th>
                  <th className="border border-black p-2 text-right">Amount</th>
               </tr>
            </thead>
            <tbody>
               {oop.items.map((item, index) => (
                  <tr key={index}>
                     <td className="border border-black p-2">{item.legalBasis}</td>
                     <td className="border border-black p-2">{item.description}</td>
                     <td className="border border-black p-2 text-right">₱ {item.amount.toFixed(2)}</td>
                  </tr>
               ))}
               <tr>
                  <td colSpan="2" className="border border-black p-2 text-right font-bold">TOTAL</td>
                  <td className="border border-black p-2 text-right font-bold">
                     ₱ {oop.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </td>
               </tr>
            </tbody>
         </table>

         {/* Signatures */}
         <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
               <div className="h-16 flex items-end justify-center mb-1">
                  {oop.rpsSignatureImage && (
                     <img src={oop.rpsSignatureImage} alt="RPS Signature" className="max-h-full" />
                  )}
               </div>
               <div className="border-t border-black pt-1">
                  <p className="font-bold">SIMEON R. DIAZ</p>
                  <p className="text-sm">SVEMS/Chief, RPS</p>
               </div>
            </div>
            <div className="text-center">
               <div className="h-16 flex items-end justify-center mb-1">
                  {oop.tsdSignatureImage && (
                     <img src={oop.tsdSignatureImage} alt="TSD Signature" className="max-h-full" />
                  )}
               </div>
               <div className="border-t border-black pt-1">
                  <p className="font-bold">Engr. CYNTHIA U. LOZANO</p>
                  <p className="text-sm">Chief, Technical Services Division</p>
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="grid grid-cols-2 gap-4">
            <div>
               <p>Received: _____________</p>
               <p>Date: _____________</p>
               <p>Released Date: _____________</p>
            </div>
            <div>
               <p>Tracking No.: _____________</p>
               <p>Time: _____________</p>
               <p>Time: _____________</p>
            </div>
         </div>

         <style jsx>{`
            @media print {
               @page {
                  size: letter portrait;
                  margin: 0.5in;
               }

               .print-page {
                  width: 8.5in;
                  padding: 0;
                  margin: 0;
               }

               body {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
               }
            }

            @media screen {
               .print-page {
                  width: 8.5in;
                  margin: 0 auto;
                  padding: 0.5in;
                  background: white;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
               }
            }
         `}</style>
      </div>
   );
};

export default OOPPrintPage;
