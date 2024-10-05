import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ApplicantOrderOfPaymentModal = ({ isOpen, onClose, orderOfPayment }) => {
    if (!orderOfPayment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Order of Payment Details</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div>
                        <strong>Application ID:</strong> {orderOfPayment.applicationId}
                    </div>
                    <div>
                        <strong>Bill No:</strong> {orderOfPayment.billNo}
                    </div>
                    <div>
                        <strong>Date Created:</strong> {new Date(orderOfPayment.dateCreated).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Applicant Name:</strong> {orderOfPayment.applicantName}
                    </div>
                    <div>
                        <strong>Address:</strong> {orderOfPayment.address}
                    </div>
                    <div>
                        <strong>Nature of Application:</strong> {orderOfPayment.natureOfApplication}
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
                            {orderOfPayment.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.legalBasis}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>₱ {item.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div>
                        <strong>Total Amount:</strong> ₱ {orderOfPayment.totalAmount.toFixed(2)}
                    </div>
                    <div>
                        <strong>Status:</strong> {orderOfPayment.status}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ApplicantOrderOfPaymentModal;
