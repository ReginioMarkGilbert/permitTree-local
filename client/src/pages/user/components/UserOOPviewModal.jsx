import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardIcon, CalendarIcon, UserIcon, MapPinIcon, FileTextIcon, CheckCircleIcon } from 'lucide-react';
import '../../../components/ui/styles/customScrollBar.css';

const UserOOPviewModal = ({ isOpen, onClose, billNo }) => {
   const [oop, setOOP] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchOOP = async () => {
         if (!billNo) return;

         try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/user/oop-by-billno/${billNo}`, {
               headers: { Authorization: token }
            });
            setOOP(response.data);
         } catch (error) {
            console.error('Error fetching OOP:', error);
            toast.error('Failed to fetch Order of Payment details');
         } finally {
            setLoading(false);
         }
      };

      if (isOpen) {
         fetchOOP();
      }
   }, [isOpen, billNo]);

   if (!isOpen) return null;

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
               <DialogTitle className="text-2xl font-bold">Order of Payment Details</DialogTitle>
               <DialogDescription>
                  Review the details of this Order of Payment.
               </DialogDescription>
            </DialogHeader>
            {loading ? (
               <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
               </div>
            ) : oop ? (
               <div className="mt-6 space-y-6">
                  <div className="border rounded-lg p-4">
                     <h3 className="text-lg font-semibold flex items-center mb-2">
                        <ClipboardIcon className="mr-2" /> OOP Number: {oop.customId}
                     </h3>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center"><FileTextIcon className="mr-2 h-4 w-4" /> Application ID: {oop.applicationId}</p>
                        <p className="flex items-center"><CheckCircleIcon className="mr-2 h-4 w-4" /> Status: {oop.status}</p>
                        <p className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Date Created: {new Date(oop.dateCreated).toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="border rounded-lg p-4">
                     <h4 className="text-lg font-semibold mb-2 flex items-center">
                        <UserIcon className="mr-2" /> Applicant Details
                     </h4>
                     <p className="flex items-center text-sm"><UserIcon className="mr-2 h-4 w-4" /> Name: {oop.applicantName}</p>
                     <p className="flex items-center text-sm mt-1"><MapPinIcon className="mr-2 h-4 w-4" /> Address: {oop.address}</p>
                  </div>

                  <div className="border rounded-lg p-4">
                     <h4 className="text-lg font-semibold mb-2">Payment Details</h4>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="w-2/3">Description</TableHead>
                              <TableHead className="w-1/3 text-right">Amount</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {oop.items.map((item, index) => (
                              <TableRow key={index}>
                                 <TableCell>{item.description}</TableCell>
                                 <TableCell className="text-right">₱ {item.amount.toFixed(2)}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                     <p className="mt-4 text-right font-semibold">Total Amount: ₱ {oop.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="border rounded-lg p-4">
                     <h4 className="text-lg font-semibold mb-2">Signatures</h4>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="font-medium">Chief RPS</p>
                           {oop.signatures.chiefRPS ? (
                              <>
                                 <p className="text-sm text-gray-600 mt-1">
                                    {new Date(oop.signatures.chiefRPS).toLocaleString()}
                                 </p>
                                 {oop.rpsSignatureImage && (
                                    <img
                                       src={oop.rpsSignatureImage}
                                       alt="Chief RPS Signature"
                                       className="max-h-24 mt-2 border-b border-gray-300 pb-2"
                                    />
                                 )}
                              </>
                           ) : (
                              <p className="text-sm text-gray-500 mt-1">Not signed</p>
                           )}
                        </div>
                        <div>
                           <p className="font-medium">Chief TSD</p>
                           {oop.signatures.technicalServices ? (
                              <>
                                 <p className="text-sm text-gray-600 mt-1">
                                    {new Date(oop.signatures.technicalServices).toLocaleString()}
                                 </p>
                                 {oop.tsdSignatureImage && (
                                    <img
                                       src={oop.tsdSignatureImage}
                                       alt="Chief TSD Signature"
                                       className="max-h-24 mt-2 border-b border-gray-300 pb-2"
                                    />
                                 )}
                              </>
                           ) : (
                              <p className="text-sm text-gray-500 mt-1">Not signed</p>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <p className="text-center text-red-600">No Order of Payment found for this application.</p>
            )}
         </DialogContent>
      </Dialog>
   );
};

export default UserOOPviewModal;
