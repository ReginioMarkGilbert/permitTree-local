import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'react-toastify';
import { UploadIcon } from "lucide-react";

const OrderOfPaymentViewModal = ({ isOpen, onClose, orderOfPayment, refreshOrderOfPayments }) => {
   const [tsdSignature, setTsdSignature] = useState(null);

   const handleSignatureUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            setTsdSignature(e.target.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSubmit = async () => {
      try {
         const token = localStorage.getItem('token');
         await axios.put(`http://localhost:3000/api/admin/order-of-payments/${orderOfPayment._id}/sign`,
            { signatureType: 'technicalServices', signature: tsdSignature },
            { headers: { Authorization: token } }
         );
         toast.success('Order of Payment signed successfully');
         refreshOrderOfPayments();
         onClose();
      } catch (error) {
         console.error('Error signing Order of Payment:', error);
         toast.error('Failed to sign Order of Payment');
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl">
            <DialogHeader>
               <DialogTitle>Order of Payment Details</DialogTitle>
               <DialogDescription>
                  Review the details of this Order of Payment.
               </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
               <div>
                  <Label>Application ID</Label>
                  <Input value={orderOfPayment?.applicationId} readOnly />
               </div>
               <div>
                  <Label>Applicant Name</Label>
                  <Input value={orderOfPayment?.applicantName} readOnly />
               </div>
               <div>
                  <Label>Nature of Application</Label>
                  <Input value={orderOfPayment?.natureOfApplication} readOnly />
               </div>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Legal Basis</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {orderOfPayment?.items.map((item, index) => (
                        <TableRow key={index}>
                           <TableCell>{item.legalBasis}</TableCell>
                           <TableCell>{item.description}</TableCell>
                           <TableCell>₱ {item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
               <div>
                  <Label>Total Amount</Label>
                  <Input value={`₱ ${orderOfPayment?.totalAmount.toFixed(2)}`} readOnly />
               </div>
               <div>
                  <Label>Chief RPS Signature</Label>
                  {orderOfPayment?.signatures.chiefRPS ? (
                     <p>Signed on: {new Date(orderOfPayment.signatures.chiefRPS).toLocaleString()}</p>
                  ) : (
                     <p>Not signed yet</p>
                  )}
               </div>
               <div>
                  <Label>TSD Signature</Label>
                  {tsdSignature ? (
                     <img src={tsdSignature} alt="TSD Signature" className="max-h-24 mt-2" />
                  ) : (
                     <div>
                        <input
                           type="file"
                           id="tsdSignature"
                           className="hidden"
                           accept="image/*"
                           onChange={handleSignatureUpload}
                        />
                        <Button
                           variant="outline"
                           onClick={() => document.getElementById('tsdSignature').click()}
                        >
                           <UploadIcon className="mr-2 h-4 w-4" />
                           Upload TSD Signature
                        </Button>
                     </div>
                  )}
               </div>
            </div>
            <DialogFooter>
               <Button onClick={onClose}>Cancel</Button>
               <Button onClick={handleSubmit} disabled={!tsdSignature}>Sign and Submit</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default OrderOfPaymentViewModal;
