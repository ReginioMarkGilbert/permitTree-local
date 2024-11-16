import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ViewORModal = ({ isOpen, onClose, oop }) => {
   const receiptRef = useRef();
   const navigate = useNavigate();

   const handlePrint = () => {
      navigate('/user/or-print', { state: { oop } });
      onClose();
   };

   React.useEffect(() => {
      console.log('ViewORModal rendered with oop:', oop);
      console.log('Official Receipt:', oop?.officialReceipt);
   }, [oop]);

   if (!oop?.officialReceipt) {
      console.log('No official receipt found');
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Error</DialogTitle>
               </DialogHeader>
               <DialogDescription>No official receipt found for this order of payment.</DialogDescription>
               <div className="flex justify-end">
                  <Button variant="outline" onClick={onClose}>
                     Close
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   const { officialReceipt } = oop;

   // Generate QR code value with essential OR details
   const qrValue = JSON.stringify({
      orNumber: officialReceipt.orNumber,
      billNo: oop.billNo,
      applicationId: oop.applicationId,
      amount: officialReceipt.amount,
      dateIssued: officialReceipt.dateIssued
   });

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl">
            <DialogHeader>
               <DialogTitle>Official Receipt Details</DialogTitle>
               <DialogDescription>View and print the official receipt.</DialogDescription>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh]">
               {/* Print Template */}
               <div ref={receiptRef} className="p-6 bg-white print:p-0">
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

                  <div className="text-center text-sm text-gray-500 print:mt-8">
                     <p>This is a system-generated official receipt.</p>
                     <p>Verify authenticity by scanning the QR code.</p>
                  </div>
               </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 print:hidden">
               <Button variant="outline" onClick={onClose}>
                  Close
               </Button>
               <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ViewORModal;
