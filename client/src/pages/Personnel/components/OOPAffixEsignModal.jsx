import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from "date-fns";
import { UploadIcon, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrderOfPayments } from '../hooks/useOrderOfPayments';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { gql, useMutation } from '@apollo/client';

const UPDATE_OOP_SIGNATURE = gql`
  mutation UpdateOOPSignature($id: ID!, $signatureType: String!, $signatureImage: String!) {
    updateOOPSignature(id: $id, signatureType: $signatureType, signatureImage: $signatureImage) {
      _id
      OOPstatus
      rpsSignatureImage
      tsdSignatureImage
      tracking {
        receivedDate
        receivedTime
        trackingNo
        releasedDate
        releasedTime
      }
    }
  }
`;

const UPDATE_OOP_TRACKING = gql`
  mutation UpdateOOPTracking($id: ID!, $tracking: OOPTrackingInput!) {
    updateOOPTracking(id: $id, tracking: $tracking) {
      _id
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
    }
  }
`;

const OOPAffixEsignModal = ({ oop, isOpen, onClose }) => {
   const [signatures, setSignatures] = useState({
      rpsSignature: oop?.rpsSignatureImage || null,
      tsdSignature: oop?.tsdSignatureImage || null
   });

   const rpsFileInputRef = useRef(null);
   const tsdFileInputRef = useRef(null);

   const { updateSignature, forwardOOPToTechnicalStaff } = useOrderOfPayments();

   const [updateOOPTracking] = useMutation(UPDATE_OOP_TRACKING);

   useEffect(() => {
      console.log('Full OOP data:', oop);
      console.log('Tracking data:', oop?.tracking);
   }, [oop]);

   const handleSignatureUpload = (event, signatureType) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            setSignatures(prev => ({ ...prev, [signatureType]: e.target.result }));
         };
         reader.readAsDataURL(file);
      }
   };

   const triggerFileInput = (e, inputRef) => {
      e.preventDefault();
      inputRef.current.click();
   };

   const handleRemoveSignature = (signatureType, inputRef) => {
      setSignatures(prev => ({ ...prev, [signatureType]: null }));
      if (inputRef.current) {
         inputRef.current.value = '';
      }
   };

   const handleSaveChanges = async () => {
      try {
         if (signatures.rpsSignature !== oop.rpsSignatureImage) {
            await updateSignature(oop._id, 'rps', signatures.rpsSignature);
         }
         if (signatures.tsdSignature !== oop.tsdSignatureImage) {
            await updateSignature(oop._id, 'tsd', signatures.tsdSignature);
         }

         // Update tracking information
         const now = new Date();
         const trackingData = {
            receivedDate: now.getTime().toString(),
            receivedTime: format(now, 'HH:mm:ss'),
            releasedDate: now.getTime().toString(),
            releasedTime: format(now, 'HH:mm:ss')
         };

         console.log('Sending tracking update:', trackingData);

         await updateOOPTracking({
            variables: {
               id: oop._id,
               tracking: trackingData
            }
         });

         // Check if both signatures are present after saving
         const hasBothSignatures = signatures.rpsSignature && signatures.tsdSignature;
         if (hasBothSignatures) {
            await forwardOOPToTechnicalStaff(oop._id);
         }

         toast.success('Signatures saved successfully');
         onClose();
      } catch (error) {
         console.error('Error in handleSaveChanges:', error);
         toast.error('Failed to save changes');
      }
   };

   const handleForwardToTechnicalStaff = async () => {
      try {
         // Check if both signatures are present
         if (!signatures.rpsSignature || !signatures.tsdSignature) {
            toast.error('Both signatures are required before forwarding');
            return;
         }

         // First, save any new signatures
         if (signatures.rpsSignature !== oop.rpsSignatureImage) {
            await updateSignature(oop._id, 'rps', signatures.rpsSignature);
         }
         if (signatures.tsdSignature !== oop.tsdSignatureImage) {
            await updateSignature(oop._id, 'tsd', signatures.tsdSignature);
         }

         // Generate tracking number and update tracking info
         const now = new Date();
         await updateOOPTracking({
            variables: {
               id: oop._id,
               tracking: {
                  receivedDate: now.getTime().toString(),
                  receivedTime: format(now, 'HH:mm:ss'),
                  releasedDate: now.getTime().toString(),
                  releasedTime: format(now, 'HH:mm:ss')
               }
            }
         });

         // Then forward to accountant
         await forwardOOPToTechnicalStaff(oop._id);
         toast.success('OOP forwarded to Technical Staff for approval');
         onClose();
      } catch (error) {
         console.error('Error in forward process:', error);
         toast.error(error.message || 'Failed to forward OOP');
      }
   };

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Order of Payment Details</DialogTitle>
               <DialogDescription>
                  Review the details of this Order of Payment.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
               {/* OOP Details Section - Read Only */}
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

               {/* Fees Table - Read Only */}
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
                     <div className="relative h-24 mb-4 border-2 border-dashed rounded-md flex items-center justify-center">
                        {signatures.rpsSignature ? (
                           <>
                              <img
                                 src={signatures.rpsSignature}
                                 alt="RPS Signature"
                                 className="max-w-full max-h-full object-contain"
                              />
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                                 onClick={() => handleRemoveSignature('rpsSignature', rpsFileInputRef)}
                              >
                                 <X className="h-4 w-4 text-red-600" />
                              </Button>
                           </>
                        ) : (
                           <p className="text-gray-400">RPS Signature</p>
                        )}
                     </div>
                     <p className="font-semibold">SIMEON R. DIAZ</p>
                     <p className="text-xs text-gray-600">SVEMS/Chief, RPS</p>
                     <input
                        type="file"
                        ref={rpsFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload(e, 'rpsSignature')}
                     />
                     <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => triggerFileInput(e, rpsFileInputRef)}
                     >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Upload Signature
                     </Button>
                  </div>

                  <div className="text-center">
                     <div className="relative h-24 mb-4 border-2 border-dashed rounded-md flex items-center justify-center">
                        {signatures.tsdSignature ? (
                           <>
                              <img
                                 src={signatures.tsdSignature}
                                 alt="TSD Signature"
                                 className="max-w-full max-h-full object-contain"
                              />
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                                 onClick={() => handleRemoveSignature('tsdSignature', tsdFileInputRef)}
                              >
                                 <X className="h-4 w-4 text-red-600" />
                              </Button>
                           </>
                        ) : (
                           <p className="text-gray-400">TSD Signature</p>
                        )}
                     </div>
                     <p className="font-semibold">Engr. CYNTHIA U. LOZANO</p>
                     <p className="text-xs text-gray-600">Chief, Technical Services Division</p>
                     <input
                        type="file"
                        ref={tsdFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload(e, 'tsdSignature')}
                     />
                     <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => triggerFileInput(e, tsdFileInputRef)}
                     >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Upload Signature
                     </Button>
                  </div>
               </div>

               {/* Add tracking information display */}
               <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                  <div>
                     <p><span className="font-semibold">Received:</span> {
                        oop.tracking?.receivedDate ? format(new Date(parseInt(oop.tracking.receivedDate)), 'MM/dd/yyyy') : 'Not yet received'
                     }</p>
                     <p><span className="font-semibold">Released Date:</span> {
                        oop.tracking?.releasedDate ? format(new Date(parseInt(oop.tracking.releasedDate)), 'MM/dd/yyyy') : 'Not yet released'
                     }</p>
                     <p><span className="font-semibold">Tracking No.:</span> {oop.tracking?.trackingNo || 'Not assigned'}</p>
                  </div>
                  <div>
                     <p><span className="font-semibold">Time:</span> {oop.tracking?.receivedTime || 'Not recorded'}</p>
                     <p><span className="font-semibold">Released Time:</span> {oop.tracking?.releasedTime || 'Not recorded'}</p>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-4 mt-6">
                  <Button
                     variant="outline"
                     onClick={onClose}
                  >
                     Cancel
                  </Button>
                  {/* <Button
                     onClick={handleSaveChanges}
                     disabled={!signatures.rpsSignature && !signatures.tsdSignature}
                  >
                     Save Changes
                  </Button> */}
                  <Button
                     onClick={handleForwardToTechnicalStaff}
                     disabled={!signatures.rpsSignature || !signatures.tsdSignature}
                     className="bg-green-600 hover:bg-green-700"
                  >
                     Forward to Technical Staff
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default OOPAffixEsignModal;
