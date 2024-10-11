import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import '@/components/ui/styles/customScrollbar.css';
import ProofOfPaymentForm from './ProofOfPaymentForm';

const UserOOPviewModal = ({ isOpen, onClose, applicationId }) => {
    const [oopData, setOopData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showProofOfPayment, setShowProofOfPayment] = useState(false);

    useEffect(() => {
        if (isOpen && applicationId) {
            fetchOOPData();
        }
    }, [isOpen, applicationId]);

    const fetchOOPData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/user/oop/${applicationId}`, {
                headers: { Authorization: token }
            });
            setOopData(response.data);
        } catch (error) {
            console.error('Error fetching OOP data:', error);
            toast.error('Failed to fetch Order of Payment data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleView = () => {
        setShowProofOfPayment(!showProofOfPayment);
    };

    const handleProofOfPaymentSubmit = async (payload) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/user/oop/${applicationId}/submit-proof`, payload, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Proof of payment submitted successfully');
            onClose();
        } catch (error) {
            console.error('Error submitting proof of payment:', error);
            toast.error('Failed to submit proof of payment');
        }
    };

    if (!isOpen) return null;

    const LabeledValue = ({ label, value }) => (
        <div className="mb-4">
            <Label className="font-semibold">{label}</Label>
            <div className="mt-1">{value}</div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-green-800">
                        {showProofOfPayment ? 'Submit Proof of Payment' : 'Order of Payment'}
                    </DialogTitle>
                    <DialogDescription>
                        {showProofOfPayment ? 'Submit the proof of payment for this Order of Payment.' : 'Review the details of this Order of Payment.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : showProofOfPayment ? (
                        <ProofOfPaymentForm onSubmit={handleProofOfPaymentSubmit} />
                    ) : oopData ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-2/3">
                                    {/* Empty div to maintain layout */}
                                </div>
                                <div className="w-1/3 text-right space-y-1">
                                    <div><span className="font-semibold">Bill No.</span> {oopData.billNo}</div>
                                    <div><span className="font-semibold">Date:</span> {format(new Date(oopData.dateCreated), "MMM d, yyyy")}</div>
                                </div>
                            </div>
                            <LabeledValue label="Name/Payee:" value={oopData.applicantName} />
                            <LabeledValue label="Address:" value={oopData.address} />
                            <LabeledValue label="Nature of Application/Permit/Documents being secured:" value={oopData.natureOfApplication} />
                            <div>
                                <Label className="font-semibold">Payment Details</Label>
                                <Table className="mt-2">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Legal Basis (DAO/SEC)</TableHead>
                                            <TableHead>Description and Computation of Fees and Charges Assessed</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {oopData.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.legalBasis}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>₱ {item.amount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-end items-center">
                                <Label className="mr-2 font-semibold">Total Amount:</Label>
                                <div>₱ {oopData.totalAmount.toFixed(2)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mt-8">
                                <div className="text-center">
                                    <Label className="font-semibold">SVEMS/Chief, RPS</Label>
                                    <div className="mt-2">{oopData.signatures.chiefRPS ? "Signed" : "Pending"}</div>
                                </div>
                                <div className="text-center">
                                    <Label className="font-semibold">Chief, Technical Services Division</Label>
                                    <div className="mt-2">{oopData.signatures.technicalServices ? "Signed" : "Pending"}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <LabeledValue
                                    label="Date for statutory receipt by applicant:"
                                    value={oopData.statutoryReceiptDate ? format(new Date(oopData.statutoryReceiptDate), "MMM d, yyyy") : '-- -- --'}
                                />
                                <LabeledValue
                                    label="Date of payment of applicant:"
                                    value={oopData.paymentDate ? format(new Date(oopData.paymentDate), "MMM d, yyyy") : '-- -- --'}
                                />
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-yellow-800">Status:</span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
                                        {oopData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No Order of Payment data found.</p>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleToggleView} className="mr-2">
                        {showProofOfPayment ? 'Back to OOP' : 'Submit Proof of Payment'}
                    </Button>
                    <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserOOPviewModal;
