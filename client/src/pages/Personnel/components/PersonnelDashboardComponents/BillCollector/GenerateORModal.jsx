import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import OfficialReceiptTemplate from './OfficialReceiptTemplate';
import { Send } from "lucide-react";

const GENERATE_OR = gql`
  mutation GenerateOR($Id: ID!, $input: GenerateORInput!) {
    generateOR(Id: $Id, input: $input) {
      _id
      OOPstatus
      officialReceipt {
        orNumber
        dateIssued
        amount
        paymentMethod
        remarks
      }
    }
  }
`;

const SEND_OR_TO_APPLICANT = gql`
  mutation SendORToApplicant($Id: ID!) {
    sendORToApplicant(Id: $Id) {
      _id
      OOPstatus
    }
  }
`;

const GenerateORModal = ({ oop, isOpen, onClose, onComplete }) => {
   const [orNumber, setOrNumber] = useState('');
   const [remarks, setRemarks] = useState('');
   const [showPreview, setShowPreview] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);
   const [generateOR] = useMutation(GENERATE_OR);
   const [sendORToApplicant] = useMutation(SEND_OR_TO_APPLICANT);
   const receiptRef = useRef();

   useEffect(() => {
      if (isOpen && !orNumber) {
         // Auto-generate OR number when modal opens
         const currentYear = new Date().getFullYear();
         const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
         setOrNumber(`OR-${currentYear}-${randomNum}`);
      }
   }, [isOpen, orNumber]);

   const handlePrint = useReactToPrint({
      content: () => receiptRef.current,
   });

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsGenerating(true);
      try {
         console.log('Submitting with ID:', oop._id); // Debug log
         const { data } = await generateOR({
            variables: {
               Id: oop._id,
               input: {
                  orNumber,
                  remarks,
                  amount: parseFloat(oop.totalAmount), // Ensure amount is a number
                  paymentMethod: 'GCASH'
               }
            }
         });

         if (data.generateOR) {
            toast.success('Official Receipt generated successfully');
            setShowPreview(true);
         }
      } catch (error) {
         console.error('Error generating OR:', error);
         toast.error(`Failed to generate Official Receipt: ${error.message}`);
      } finally {
         setIsGenerating(false);
      }
   };

   const handleSendToApplicant = async () => {
      try {
         await sendORToApplicant({
            variables: {
               Id: oop._id
            }
         });
         toast.success('Official Receipt sent to applicant');
         onComplete();
         onClose();
      } catch (error) {
         console.error('Error sending OR:', error);
         toast.error(`Failed to send Official Receipt: ${error.message}`);
      }
   };

   const handleClose = () => {
      setShowPreview(false);
      onComplete();
      onClose();
   };

   if (showPreview) {
      return (
         <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl">
               <DialogHeader>
                  <DialogTitle>Official Receipt Preview</DialogTitle>
               </DialogHeader>
               <div className="overflow-auto max-h-[70vh]">
                  <OfficialReceiptTemplate
                     ref={receiptRef}
                     oop={oop}
                     orDetails={{
                        orNumber,
                        dateIssued: new Date(),
                        paymentMethod: 'GCASH',
                        remarks
                     }}
                  />
               </div>
               <div className="flex justify-end gap-2">
                  <Button
                     variant="outline"
                     onClick={handleClose}
                  >
                     Close
                  </Button>
                  <Button
                     onClick={handlePrint}
                     className="bg-blue-600 hover:bg-blue-700"
                  >
                     Print
                  </Button>
                  <Button
                     onClick={handleSendToApplicant}
                     className="bg-green-600 hover:bg-green-700"
                  >
                     <Send className="mr-2 h-4 w-4" />
                     Send to Applicant
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Generate Official Receipt</DialogTitle>
               <DialogDescription>
                  Review the auto-generated OR number and add any remarks.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                     <Label>Payment Details</Label>
                     <div className="text-sm">
                        <p><span className="font-medium">Application No:</span> {oop.applicationId}</p>
                        <p><span className="font-medium">Bill No:</span> {oop.billNo}</p>
                        <p><span className="font-medium">Amount:</span> ₱{oop.totalAmount?.toFixed(2)}</p>
                     </div>
                  </div>

                  <div className="grid gap-2">
                     <Label htmlFor="orNumber">OR Number (Auto-generated)</Label>
                     <Input
                        id="orNumber"
                        value={orNumber}
                        readOnly
                        className="bg-gray-50"
                     />
                  </div>

                  <div className="grid gap-2">
                     <Label htmlFor="remarks">Remarks</Label>
                     <Textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any remarks..."
                     />
                  </div>
               </div>

               <div className="flex justify-end gap-2">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={onClose}
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     className="bg-green-600 hover:bg-green-700"
                     disabled={isGenerating}
                  >
                     {isGenerating ? 'Generating...' : 'Generate OR'}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default GenerateORModal;
