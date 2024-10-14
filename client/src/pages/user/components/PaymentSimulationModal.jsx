import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const PaymentSimulationModal = ({ isOpen, onClose, onPaymentComplete, totalAmount, applicationId, billNo }) => {
   const [cardNumber, setCardNumber] = useState('');
   const [expiryDate, setExpiryDate] = useState('');
   const [cvv, setCvv] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const [totalAmountState, setTotalAmount] = useState(totalAmount);

   useEffect(() => {
      if (isOpen && !totalAmount) {
         fetchTotalAmount();
      }
   }, [isOpen, totalAmount, billNo]);

   useEffect(() => {
      const fetchTotalAmount = async () => {
         if (!billNo) return;

         try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/user/oop-by-billno/${billNo}`, {
               headers: { Authorization: token }
            });
            setTotalAmount(response.data.totalAmount);
         } catch (error) {
            console.error('Error fetching total amount:', error);
            setError('Failed to fetch payment details');
         } finally {
            setLoading(false);
         }
      };
      if (isOpen) {
         fetchTotalAmount();
      }
   }, [isOpen, billNo]);

   if (!isOpen) return null;

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsProcessing(true);
      setError('');
      try {
         await onPaymentComplete({
            cardNumber,
            expiryDate,
            cvv,
            totalAmount: totalAmountState,
            billNo
         });
      } catch (error) {
         console.error('Payment processing error:', error);
      } finally {
         setIsProcessing(false);
      }
   };

   const formatCardNumber = (value) => {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
         parts.push(match.substring(i, i + 4));
      }

      if (parts.length) {
         return parts.join(' ');
      } else {
         return value;
      }
   };

   const handleCardNumberChange = (e) => {
      const formattedValue = formatCardNumber(e.target.value);
      setCardNumber(formattedValue);
   };

   const formatExpiryDate = (value) => {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) {
         const month = v.slice(0, 2);
         const year = v.slice(2, 4);
         return `${month}/${year}`;
      }
      return v;
   };

   const handleExpiryDateChange = (e) => {
      const formattedValue = formatExpiryDate(e.target.value);
      setExpiryDate(formattedValue);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Simulate Payment</DialogTitle>
               <DialogDescription>
                  Please enter your payment details to simulate the transaction.
               </DialogDescription>
            </DialogHeader>
            {loading ? (
               <p>Loading payment details...</p>
            ) : error ? (
               <p className="text-red-500">{error}</p>
            ) : (
               <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                     <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                           id="cardNumber"
                           value={cardNumber}
                           onChange={handleCardNumberChange}
                           placeholder="1234 5678 9012 3456"
                           maxLength={19}
                           required
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="expiryDate">Expiry Date</Label>
                           <Input
                              id="expiryDate"
                              value={expiryDate}
                              onChange={handleExpiryDateChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                           />
                        </div>
                        <div>
                           <Label htmlFor="cvv">CVV</Label>
                           <Input
                              id="cvv"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="123"
                              maxLength={4}
                              required
                           />
                        </div>
                     </div>
                     <div>
                        <Label>Total Amount</Label>
                        <p className="font-bold">{`₱${totalAmountState.toFixed(2)}`}</p>
                     </div>
                  </div>
                  <DialogFooter className="mt-6">
                     <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                     <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                     </Button>
                  </DialogFooter>
               </form>
            )}
         </DialogContent>
      </Dialog>
   );
};

export default PaymentSimulationModal;
