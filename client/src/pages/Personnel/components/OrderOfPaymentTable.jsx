import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Printer, FileText } from 'lucide-react';

const OrderOfPaymentTable = ({ orderOfPayments, searchTerm, activeTab, onViewOrderOfPayment, onReviewProofOfPayment }) => {
    const filteredOrderOfPayments = orderOfPayments.filter(oop =>
        oop.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        oop.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Signature': return 'bg-yellow-100 text-yellow-800';
            case 'Awaiting Payment': return 'bg-blue-100 text-blue-800';
            case 'Payment Proof Submitted': return 'bg-purple-100 text-purple-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredOrderOfPayments.map((oop) => (
                    <TableRow key={oop._id}>
                        <TableCell>{oop.applicationId}</TableCell>
                        <TableCell>{oop.applicantName}</TableCell>
                        <TableCell>{new Date(oop.dateCreated).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(oop.status)}`}>
                                {oop.status}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                                    onClick={() => onViewOrderOfPayment(oop)}
                                    title="View"
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>

                                {oop.status === 'Pending Signature' && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                        onClick={() => onViewOrderOfPayment(oop)}
                                        title="Affix Signature"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                )}

                                {oop.status === 'Payment Proof Submitted' && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                                        onClick={() => onReviewProofOfPayment(oop)}
                                        title="Review Payment"
                                    >
                                        <FileText className="h-3 w-3" />
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 text-gray-600 hover:text-gray-700 border-gray-200 hover:bg-gray-50"
                                    onClick={() => console.log('Print Order of Payment:', oop)}
                                    title="Print"
                                >
                                    <Printer className="h-3 w-3" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default OrderOfPaymentTable;
