import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Loader2, X, FileText } from 'lucide-react';

const ChiefRPSProofOfPaymentReview = ({ isOpen, onClose, oopId }) => {
    const [oopData, setOopData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

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

    const handleFileClick = () => {
        if (oopData && oopData.proofOfPayment) {
            const fileUrl = `http://localhost:3000/api/admin/order-of-payments/${oopId}/proof-of-payment`;
            setPreviewUrl(fileUrl);
        }
    };

    const handleClosePreview = () => {
        setPreviewUrl(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-800">
                            Review Proof of Payment
                        </DialogTitle>
                        <DialogDescription>
                            Review the proof of payment for this Order of Payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            </div>
                        ) : oopData ? (
                            <div className="space-y-6">
                                <div>
                                    <Label className="font-semibold">OR Number</Label>
                                    <div className="mt-1">{oopData.orNumber}</div>
                                </div>
                                {oopData.proofOfPayment && (
                                    <div>
                                        <Label className="font-semibold">Proof of Payment</Label>
                                        <div className="mt-2">
                                            <Button onClick={handleFileClick} className="flex items-center space-x-2">
                                                <FileText size={20} />
                                                <span>View Proof of Payment</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No Order of Payment data found.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => handleReviewAction('approve')} className="bg-green-600 hover:bg-green-700 text-white">
                            Approve
                        </Button>
                        <Button onClick={() => handleReviewAction('reject')} className="bg-red-600 hover:bg-red-700 text-white">
                            Reject
                        </Button>
                        <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="relative w-full h-full max-w-4xl max-h-4xl bg-white p-4">
                        <iframe
                            src={previewUrl}
                            title="Proof of Payment"
                            className="w-full h-full"
                        />
                        <Button onClick={handleClosePreview} className="absolute top-2 right-2 bg-white text-black">
                            <X size={20} />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChiefRPSProofOfPaymentReview;
