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

    const handleSubmit = (e) => {
        e.preventDefault();
        onPaymentComplete(applicationId);
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
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="1234 5678 9012 3456"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                    <Input
                                        id="expiryDate"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        placeholder="MM/YY"
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
                            <Button type="submit">Pay Now</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentSimulationModal;
