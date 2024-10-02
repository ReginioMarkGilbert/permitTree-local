import React, { useState, useRef } from 'react';
import { X, CalendarIcon, PlusIcon, MinusIcon, UploadIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import "@/components/ui/styles/customScrollbar.css";  // Import the custom scrollbar CSS

const OrderOfPaymentModal = ({ isOpen, onClose, application }) => {
    const [rows, setRows] = useState([{ id: 1, legalBasis: '', description: '', amount: '' }]);
    const [billDate, setBillDate] = useState(new Date());
    const [paymentDate, setPaymentDate] = useState(null);
    const [receiptDate, setReceiptDate] = useState(null);
    const [rpsSignature, setRpsSignature] = useState(null);
    const [tsdSignature, setTsdSignature] = useState(null);
    const rpsNameRef = useRef(null);
    const tsdNameRef = useRef(null);
    const rpsFileInputRef = useRef(null);
    const tsdFileInputRef = useRef(null);

    const addRow = (e) => {
        e.preventDefault(); // Prevent the default button behavior
        const newRow = { id: Date.now(), legalBasis: '', description: '', amount: '' };
        setRows(prevRows => [...prevRows, newRow]); // Use functional update to ensure we're working with the latest state
    };

    const removeRow = (id) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const updateRow = (id, field, value) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleSignatureUpload = (event, setSignature, nameRef) => {
        event.preventDefault(); // Prevent default behavior
        event.stopPropagation(); // Stop event propagation
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSignature(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = (e, inputRef) => {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Stop event propagation
        inputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement submission logic
        console.log('Form submitted:', { rows, billDate, paymentDate, receiptDate, rpsSignature, tsdSignature });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Assessment of Fees and Charges</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow p-6 custom-scrollbar"> {/* Added custom-scrollbar class here */}
                    <p className="text-center mb-4 text-sm">(SPLTP/ PLTP/ Clearance to cut/ Certification/ WRP/TCP)</p>

                    <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased space between form elements */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="billNo">Bill No.</Label>
                                <Input id="billNo" className="w-full" />
                            </div>
                            <div>
                                <Label htmlFor="billDate">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="billDate" variant="outline" className="w-full justify-start text-left">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {billDate ? format(billDate, "MMM d, yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={billDate} onSelect={setBillDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="name">Name/Payee:</Label>
                            <Input id="name" className="w-full" />
                        </div>
                        <div>
                            <Label htmlFor="address">Address:</Label>
                            <Input id="address" className="w-full" />
                        </div>
                        <div>
                            <Label htmlFor="nature">Nature of Application/Permit/Documents being secured:</Label>
                            <Input id="nature" className="w-full" />
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">Legal Basis (DAO/SEC)</TableHead>
                                    <TableHead className="w-1/2">Description and Computation of Fees and Charges Assessed</TableHead>
                                    <TableHead className="w-1/4">Amount</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell><Input value={row.legalBasis} onChange={(e) => updateRow(row.id, 'legalBasis', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.description} onChange={(e) => updateRow(row.id, 'description', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.amount} onChange={(e) => updateRow(row.id, 'amount', e.target.value)} /></TableCell>
                                        <TableCell>
                                            {index > 0 && (
                                                <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)}>
                                                    <MinusIcon className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-between items-center mt-6"> {/* Added margin top */}
                            <Button variant="outline" onClick={addRow} size="sm" type="button">
                                <PlusIcon className="h-4 w-4 mr-2" /> Add Row
                            </Button>
                            <div className="flex items-center">
                                <Label className="mr-2">Total:</Label>
                                <Input className="w-32" value={`P ${rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0).toFixed(2)}`} readOnly />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mt-8"> {/* Increased gap and added margin top */}
                            <div className="text-center relative">
                                <div className="h-24 mb-4"> {/* Added fixed height container for signature */}
                                    {rpsSignature && (
                                        <img
                                            src={rpsSignature}
                                            alt="RPS E-Signature"
                                            className="max-w-full max-h-full mx-auto object-contain"
                                        />
                                    )}
                                </div>
                                <Input ref={rpsNameRef} className="text-center font-semibold" defaultValue="SIMEON R. DIAZ" />
                                <p className="text-xs mt-1">SVEMS/Chief, RPS</p>
                                <input
                                    type="file"
                                    ref={rpsFileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleSignatureUpload(e, setRpsSignature, rpsNameRef)}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={(e) => triggerFileInput(e, rpsFileInputRef)}
                                >
                                    <UploadIcon className="h-4 w-4 mr-2" />
                                    Upload E-Signature
                                </Button>
                            </div>
                            <div className="text-center relative">
                                <div className="h-24 mb-4"> {/* Added fixed height container for signature */}
                                    {tsdSignature && (
                                        <img
                                            src={tsdSignature}
                                            alt="TSD E-Signature"
                                            className="max-w-full max-h-full mx-auto object-contain"
                                        />
                                    )}
                                </div>
                                <Input ref={tsdNameRef} className="text-center font-semibold" defaultValue="Engr. CYNTHIA U. LOZANO" />
                                <p className="text-xs mt-1">Chief, Technical Services Division</p>
                                <input
                                    type="file"
                                    ref={tsdFileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleSignatureUpload(e, setTsdSignature, tsdNameRef)}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={(e) => triggerFileInput(e, tsdFileInputRef)}
                                >
                                    <UploadIcon className="h-4 w-4 mr-2" />
                                    Upload E-Signature
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Date of payment of applicant:</Label>
                                <div className="flex space-x-2 mt-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {paymentDate ? format(paymentDate, "MMM d, yyyy") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <TimePicker className="w-[120px]" />
                                </div>
                            </div>
                            <div>
                                <Label>Date for statutory receipt by applicant:</Label>
                                <div className="flex space-x-2 mt-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {receiptDate ? format(receiptDate, "MMM d, yyyy") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={receiptDate} onSelect={setReceiptDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <TimePicker className="w-[120px]" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="border-t p-4 flex justify-end">
                    <Button type="submit" onClick={handleSubmit}>Submit Form</Button>
                </div>
            </div>
        </div>
    );
};

export default OrderOfPaymentModal;
