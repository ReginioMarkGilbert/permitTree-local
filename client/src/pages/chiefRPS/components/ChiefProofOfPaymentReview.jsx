import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import '@/components/ui/styles/customScrollbar.css';

const ChiefRPSProofOfPaymentReview = ({ isOpen, onClose, oopId }) => {
    const [oopData, setOopData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showProofOfPayment, setShowProofOfPayment] = useState(false);

    useEffect(() => {
        if (isOpen && oopId) {
            fetchOOPData();
        }
    }, [isOpen, oopId]);

    const fetchOOPData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/order-of-payments/${oopId}`, {
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

    const handleReviewAction = async (action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/admin/order-of-payments/${oopId}/review-proof`,
                { action },
                { headers: { Authorization: token } }
            );
            toast.success(`Proof of payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            onClose();
        } catch (error) {
            console.error('Error reviewing proof of payment:', error);
            toast.error('Failed to review proof of payment');
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
                        {showProofOfPayment ? 'Review Proof of Payment' : 'Order of Payment Details'}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : showProofOfPayment ? (
                        <div className="space-y-4">
                            <LabeledValue label="OR Number" value={oopData.orNumber} />
                            {oopData.proofOfPayment && (
                                <div>
                                    <Label className="font-semibold">Proof of Payment</Label>
                                    <img
                                        src={`data:${oopData.proofOfPayment.contentType};base64,${Buffer.from(oopData.proofOfPayment.data).toString('base64')}`}
                                        alt="Proof of Payment"
                                        className="mt-2 max-w-full h-auto"
                                    />
                                </div>
                            )}
                        </div>
                    ) : oopData ? (
                        <div className="space-y-6">
                            <LabeledValue label="Applicant Name" value={oopData.applicantName} />
                            <LabeledValue label="Application ID" value={oopData.applicationId} />
                            <LabeledValue label="Bill No" value={oopData.billNo} />
                            <LabeledValue label="Date Created" value={format(new Date(oopData.dateCreated), "MMM d, yyyy")} />
                            <LabeledValue label="Address" value={oopData.address} />
                            <LabeledValue label="Nature of Application" value={oopData.natureOfApplication} />
                            <LabeledValue label="Total Amount" value={`₱ ${oopData.totalAmount.toFixed(2)}`} />
                            <LabeledValue label="Status" value={oopData.status} />

                            <div>
                                <Label className="font-semibold">Items</Label>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Legal Basis</TableHead>
                                            <TableHead>Description</TableHead>
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
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No Order of Payment data found.</p>
                    )}
                </div>
                <DialogFooter>
                    {showProofOfPayment ? (
                        <>
                            <Button onClick={() => handleReviewAction('approve')} className="bg-green-600 hover:bg-green-700 text-white">
                                Approve
                            </Button>
                            <Button onClick={() => handleReviewAction('reject')} className="bg-red-600 hover:bg-red-700 text-white">
                                Reject
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleToggleView} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Review Proof of Payment
                        </Button>
                    )}
                    <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChiefRPSProofOfPaymentReview;
