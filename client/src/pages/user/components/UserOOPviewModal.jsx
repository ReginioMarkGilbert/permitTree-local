import React from 'react';
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserOOPviewModal = ({ oop, isOpen, onClose }) => {
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Order of Payment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
               {/* OOP Details Section */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label>Bill No.</Label>
                     <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                        {oop?.billNo}
                     </div>
                  </div>
                  <div>
                     <Label>Date</Label>
                     <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                        {formatDate(oop?.createdAt)}
                     </div>
                  </div>
               </div>

               <div>
                  <Label>Name/Payee</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                     {oop?.namePayee}
                  </div>
               </div>

               <div>
                  <Label>Address</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                     {oop?.address}
                  </div>
               </div>

               <div>
                  <Label>Nature of Application</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                     {oop?.natureOfApplication}
                  </div>
               </div>

               {/* Fees Table */}
               <div>
                  <Label>Fees and Charges</Label>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Legal Basis</TableHead>
                           <TableHead>Description</TableHead>
                           <TableHead>Amount</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {oop?.items?.map((item, index) => (
                           <TableRow key={index}>
                              <TableCell>{item.legalBasis}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>₱ {item.amount.toFixed(2)}</TableCell>
                           </TableRow>
                        ))}
                        <TableRow>
                           <TableCell colSpan={2} className="text-right font-bold">Total:</TableCell>
                           <TableCell className="font-bold">
                              ₱ {oop?.items?.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                           </TableCell>
                        </TableRow>
                     </TableBody>
                  </Table>
               </div>

               {/* Signature Section */}
               <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="text-center">
                     <div className="h-24 mb-4 border-2 rounded-md flex items-center justify-center">
                        {oop?.rpsSignatureImage ? (
                           <img
                              src={oop.rpsSignatureImage}
                              alt="RPS Signature"
                              className="max-w-full max-h-full object-contain"
                           />
                        ) : (
                           <p className="text-gray-400">RPS Signature Pending</p>
                        )}
                     </div>
                     <p className="font-semibold">SIMEON R. DIAZ</p>
                     <p className="text-xs text-gray-600">SVEMS/Chief, RPS</p>
                  </div>

                  <div className="text-center">
                     <div className="h-24 mb-4 border-2 rounded-md flex items-center justify-center">
                        {oop?.tsdSignatureImage ? (
                           <img
                              src={oop.tsdSignatureImage}
                              alt="TSD Signature"
                              className="max-w-full max-h-full object-contain"
                           />
                        ) : (
                           <p className="text-gray-400">TSD Signature Pending</p>
                        )}
                     </div>
                     <p className="font-semibold">Engr. CYNTHIA U. LOZANO</p>
                     <p className="text-xs text-gray-600">Chief, Technical Services Division</p>
                  </div>
               </div>

               {/* Status Section */}
               <div className="mt-6">
                  <Label>Status</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                     {oop?.OOPstatus}
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default UserOOPviewModal;
