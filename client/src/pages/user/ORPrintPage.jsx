import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from 'sonner';

const ORPrintPage = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { oop } = location.state || {};

   if (!oop || !oop.officialReceipt) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500">No official receipt data found</p>
               <Button
                  variant="outline"
                  onClick={() => navigate('/applicationsStatus')}
                  className="mt-4"
               >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Applications
               </Button>
            </div>
         </div>
      );
   }

   const { officialReceipt } = oop;

   let check = 0;
   useEffect(() => {
      check++;
      if (location.pathname === '/user/or-print') {
         if (check === 1) { // prevent multiple toast from appearing
            toast.info('Please wait while we print your Offcial Receipt...', { duration: 3000, position: 'top-center' });
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

   // Generate QR code value with essential OR details
   const qrValue = JSON.stringify({
      orNumber: officialReceipt.orNumber,
      billNo: oop.billNo,
      applicationId: oop.applicationId,
      amount: officialReceipt.amount,
      dateIssued: officialReceipt.dateIssued
   });

   return (
      <div className="min-h-screen bg-white">
         {/* Print Controls - Hide when printing */}
         <div className="print:hidden p-4 flex justify-between items-center">
            <Button
               variant="outline"
               onClick={() => navigate('/applicationsStatus')}
               className="flex items-center gap-2"
            >
               <ArrowLeft className="h-4 w-4" />
               Back
            </Button>
         </div>

         {/* Receipt Content */}
         <div className="max-w-3xl mx-auto p-8">
            <div className="text-center mb-6">
               <h2 className="text-xl font-bold">OFFICIAL RECEIPT</h2>
               <p className="text-sm text-gray-600">Department of Environment and Natural Resources</p>
               <p className="text-sm text-gray-600">PENRO Marinduque</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div>
                  <p><span className="font-semibold">OR Number:</span> {officialReceipt.orNumber}</p>
                  <p><span className="font-semibold">Date Issued:</span> {formatDate(officialReceipt.dateIssued)}</p>
                  <p><span className="font-semibold">Payment Method:</span> {officialReceipt.paymentMethod}</p>
               </div>
               <div>
                  <p><span className="font-semibold">Application No:</span> {oop.applicationId}</p>
                  <p><span className="font-semibold">Bill No:</span> {oop.billNo}</p>
                  <p><span className="font-semibold">Amount:</span> ₱{officialReceipt.amount.toFixed(2)}</p>
               </div>
            </div>

            <div className="mb-6">
               <p><span className="font-semibold">Payee:</span> {oop.namePayee}</p>
               <p><span className="font-semibold">Address:</span> {oop.address}</p>
               <p><span className="font-semibold">Nature of Application:</span> {oop.natureOfApplication}</p>
            </div>

            {officialReceipt.remarks && (
               <div className="mb-6">
                  <p><span className="font-semibold">Remarks:</span></p>
                  <p className="text-gray-700">{officialReceipt.remarks}</p>
               </div>
            )}

            <div className="flex justify-center mb-6">
               <div className="p-4 bg-white">
                  <QRCode
                     value={qrValue}
                     size={128}
                     style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                     viewBox={`0 0 128 128`}
                  />
               </div>
            </div>

            <div className="text-center text-sm text-gray-500">
               <p>This is a system-generated official receipt.</p>
               <p>Verify authenticity by scanning the QR code.</p>
            </div>
         </div>
      </div>
   );
};

export default ORPrintPage;
