import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import denrLogo from "@/assets/denr-logo.png";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from 'sonner';
import { getUserRoles } from '@/utils/auth';

const OOPPrintPage = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const oop = location.state?.oop;

   const userRoles = getUserRoles();
   useEffect(() => {
      if (!oop && !userRoles.includes('user')) {
         navigate('/applicationsStatus');
      } else if (!oop && !userRoles.includes('accountant')) {
         navigate('/personnel/accountant');
      } else if (!oop && !userRoles.includes('Chief_RPS') && !userRoles.includes('Chief_TSD')) {
         navigate('/personnel/chief');
      } else {
         return;
      }
   }, [oop, navigate]);

   let check = 0;
   useEffect(() => {
      check++;
      if (location.pathname === '/user/oop-print') {
         if (check === 1) { // prevent multiple toast from appearing
            toast.info('Please wait while we print your Order of Payment...', { duration: 3000, position: 'top-center' });
         }
         if (check === 1) { // prevent multiple print window from opening
            setTimeout(() => {
               window.print();
            }, 3500);
         }
      } else {
         toast.error('Invalid URL');
         navigate('/applicationsStatus');
      }
   }, [location.pathname]);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const handleBack = () => {
      navigate('/applicationsStatus');
   };

   if (!oop) return null;

   return (
      <div className="print-page bg-white min-h-screen">
         {/* Back Button - will be hidden during print */}
         <div className="fixed top-4 left-4 no-print">
            <Button
               variant="outline"
               onClick={handleBack}
               className="flex items-center gap-2"
            >
               <ArrowLeft className="h-4 w-4" />
               Back
            </Button>
         </div>

         <div className="print-content max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="text-center mb-6">
               <img src={denrLogo} alt="DENR Logo" className="mx-auto w-20 mb-2" />
               <p className="text-base">Republic of the Philippines</p>
               <p className="text-base">Department of Environment and Natural Resources</p>
               <p className="text-base">PENRO Marinduque</p>
            </div>

            <h1 className="text-center font-bold text-xl mb-6">Assessment of Fees and Charges</h1>

            {/* Bill Info */}
            <div className="text-right mb-6">
               <p>Bill No.: {oop.billNo}</p>
               <p>Date: {formatDate(oop.createdAt)}</p>
            </div>

            {/* Main Info */}
            <div className="mb-6">
               <div className="mb-3">
                  <span className="font-bold">Name/Payee:</span> {oop.namePayee}
               </div>
               <div className="mb-3">
                  <span className="font-bold">Address:</span> {oop.address}
               </div>
               <div className="mb-3">
                  <span className="font-bold">Nature of Application/Permit/Documents being secured:</span>
                  <div>{oop.natureOfApplication}</div>
               </div>
            </div>

            {/* Fees Table */}
            <table className="w-full border-collapse border border-black mb-8">
               <thead>
                  <tr>
                     <th className="border border-black p-2 text-left w-1/4">Legal Basis (DAO/SEC)</th>
                     <th className="border border-black p-2 text-left">Description and Computation of Fees and Charges</th>
                     <th className="border border-black p-2 text-right w-1/6">Amount</th>
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
                  <div className="h-16 flex items-end justify-center mb-2">
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
                  <div className="h-16 flex items-end justify-center mb-2">
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
            <div className="grid grid-cols-2 gap-4 text-sm">
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
         </div>

         <style>{`
            @media print {
               @page {
                  size: letter;
                  margin: 0.5in;
               }

               body {
                  margin: 0;
                  padding: 0;
               }

               .print-page {
                  width: 100%;
                  height: 100%;
                  position: fixed;
                  top: 0;
                  left: 0;
                  margin: 0;
                  padding: 0;
                  background: white;
               }

               .print-content {
                  padding: 0;
                  max-width: none;
                  margin: 0;
               }

               nav, footer, button {
                  display: none !important;
               }

               .no-print {
                  display: none !important;
               }
            }
         `}</style>
      </div>
   );
};

export default OOPPrintPage;
