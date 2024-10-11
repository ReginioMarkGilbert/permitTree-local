import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'react-toastify';

const PaymentSimulationModal = ({ isOpen, onClose, onPaymentComplete, applicationId }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && applicationId) {
            fetchTotalAmount();
        }
    }, [isOpen, applicationId]);

    const fetchTotalAmount = async () => {
        if (!applicationId) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/user/oop/${applicationId}`, {
                headers: { Authorization: token }
            });
            console.log('OOP Response:', response.data);
            setTotalAmount(response.data.totalAmount || 0);
        } catch (error) {
            console.error('Error fetching total amount:', error);
            setError('Failed to fetch payment details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:3000/api/user/oop/${applicationId}/simulate-payment`, {}, {
                headers: { Authorization: token },
                responseType: 'blob' // Important for handling PDF response
            });

            // Create a blob from the PDF stream
            const file = new Blob([response.data], { type: 'application/pdf' });

            // Create a link and trigger download
            const fileURL = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = `receipt_${applicationId}.pdf`;
            link.click();

            toast.success('Payment successful. Receipt downloaded.');
            onPaymentComplete(applicationId);
            onClose();
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Failed to process payment');
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
            return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
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
                                <p>{`₱${totalAmount.toFixed(2)}`}</p>
                                {/* <Input className="font-bold" value={`₱${totalAmount.toFixed(2)}`} disabled /> */}
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
