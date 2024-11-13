// used both by user and personnel
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ViewOOPModal = ({ isOpen, onClose, oop }) => {
   const navigate = useNavigate();

   useEffect(() => {
      console.log('OOP data in ViewOOPModal:', oop);
      console.log('Tracking info:', {
         receivedDate: oop?.receivedDate,
         receivedTime: oop?.receivedTime,
         trackingNo: oop?.trackingNo,
         releasedDate: oop?.releasedDate,
         releasedTime: oop?.releasedTime
      });
   }, [oop]);

   const handlePrint = () => {
      navigate('/user/oop-print', { state: { oop } });
      onClose();
   };

   const formatDate = (timestamp) => {
      if (!timestamp) return '_____________';
      const date = new Date(parseInt(timestamp));
      return format(date, 'MM/dd/yyyy');
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl">
            <DialogHeader>
               <DialogTitle>Order of Payment Details</DialogTitle>
               <DialogDescription>View the details of the order of payment.</DialogDescription>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh]">
               <div className="p-6 bg-white">
                  <div className="text-center mb-6">
                     <h2 className="text-xl font-bold">ORDER OF PAYMENT</h2>
                     <p className="text-sm text-gray-600">Department of Environment and Natural Resources</p>
                     <p className="text-sm text-gray-600">PENRO Marinduque</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <p><span className="font-semibold">Bill No:</span> {oop.billNo}</p>
                        <p><span className="font-semibold">Date:</span> {format(new Date(parseInt(oop.createdAt)), 'MMMM d, yyyy')}</p>
                     </div>
                     <div>
                        <p><span className="font-semibold">Application No:</span> {oop.applicationNumber}</p>
                        <p><span className="font-semibold">Status:</span> {oop.OOPstatus}</p>
                     </div>
                  </div>

                  <div className="mb-6">
                     <p><span className="font-semibold">Payee:</span> {oop.namePayee}</p>
                     <p><span className="font-semibold">Address:</span> {oop.address}</p>
                     <p><span className="font-semibold">Nature of Application:</span> {oop.natureOfApplication}</p>
                  </div>

                  <div className="mb-6">
                     <h3 className="font-semibold mb-2">Items:</h3>
                     <table className="min-w-full">
                        <thead>
                           <tr className="border-b">
                              <th className="text-left py-2">Legal Basis</th>
                              <th className="text-left py-2">Description</th>
                              <th className="text-right py-2">Amount</th>
                           </tr>
                        </thead>
                        <tbody>
                           {oop.items?.map((item, index) => (
                              <tr key={index} className="border-b">
                                 <td className="py-2">{item.legalBasis}</td>
                                 <td className="py-2">{item.description}</td>
                                 <td className="py-2 text-right">₱{item.amount.toFixed(2)}</td>
                              </tr>
                           ))}
                           <tr className="font-semibold">
                              <td colSpan={2} className="py-2 text-right">Total Amount:</td>
                              <td className="py-2 text-right">₱{oop.totalAmount.toFixed(2)}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  {oop.rpsSignatureImage && oop.tsdSignatureImage && (
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                           <img src={oop.rpsSignatureImage} alt="RPS Signature" className="h-20 mx-auto" />
                           <p className="mt-2 text-sm font-semibold">Chief, Regulatory & Permitting Section</p>
                        </div>
                        <div className="text-center">
                           <img src={oop.tsdSignatureImage} alt="TSD Signature" className="h-20 mx-auto" />
                           <p className="mt-2 text-sm font-semibold">Technical Services Division</p>
                        </div>
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                     <div>
                        <p><span className="font-semibold">Received:</span> {
                           oop.receivedDate ? formatDate(oop.receivedDate) : '_____________'
                        }</p>
                        <p><span className="font-semibold">Released Date:</span> {
                           oop.releasedDate ? formatDate(oop.releasedDate) : '_____________'
                        }</p>
                        <p><span className="font-semibold">Tracking No.:</span> {oop.trackingNo || '_____________'}</p>
                     </div>
                     <div>
                        <p><span className="font-semibold">Time:</span> {oop.receivedTime || '_____________'}</p>
                        <p><span className="font-semibold">Released Time:</span> {oop.releasedTime || '_____________'}</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <Button variant="outline" onClick={onClose}>
                  Close
               </Button>
               <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                  <Printer className="mr-2 h-4 w-4" />
                  Print OOP
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default ViewOOPModal;
