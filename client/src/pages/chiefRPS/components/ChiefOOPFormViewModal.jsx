import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ChiefOOPFormViewModal = ({ isOpen, onClose, orderOfPayment }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>View Order of Payment</DialogTitle>
                    <DialogDescription>
                        Review the details of this Order of Payment.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Application Details</h3>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Application ID</TableCell>
                                <TableCell>{orderOfPayment.applicationId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Applicant Name</TableCell>
                                <TableCell>{orderOfPayment.applicantName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Bill No.</TableCell>
                                <TableCell>{orderOfPayment.billNo}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Date Created</TableCell>
                                <TableCell>{new Date(orderOfPayment.dateCreated).toLocaleDateString()}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Address</TableCell>
                                <TableCell>{orderOfPayment.address}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Nature of Application</TableCell>
                                <TableCell>{orderOfPayment.natureOfApplication}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Status</TableCell>
                                <TableCell>{orderOfPayment.status}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <h3 className="text-lg font-semibold mt-6 mb-2">Payment Items</h3>
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
                                    <TableCell>₱{item.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} className="font-semibold text-right">Total Amount</TableCell>
                                <TableCell className="font-semibold">₱{orderOfPayment.totalAmount.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <h3 className="text-lg font-semibold mt-6 mb-2">Signatures</h3>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Chief RPS</TableCell>
                                <TableCell>{orderOfPayment.signatures.chiefRPS ? new Date(orderOfPayment.signatures.chiefRPS).toLocaleString() : 'Not signed'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Chief TSD</TableCell>
                                <TableCell>{orderOfPayment.signatures.technicalServices ? new Date(orderOfPayment.signatures.technicalServices).toLocaleString() : 'Not signed'}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChiefOOPFormViewModal;
