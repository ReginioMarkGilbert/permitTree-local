import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, MinusIcon, UploadIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import "@/components/ui/styles/customScrollbar.css";
import { TimePicker } from "@/components/ui/time-picker";
import axios from 'axios';


const OrderOfPaymentModal = ({ isOpen, onClose, application }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        billNo: '',
        date: new Date(),
        namePayee: '',
        address: '',
        natureOfApplication: '',
        fees: [{ id: 1, legalBasis: '', description: '', amount: '' }],
        rpsSignature: null,
        tsdSignature: null,
        paymentDate: null,
        paymentTime: null,
        receiptDate: null,
        receiptTime: null
    });
    const [acceptedApplications, setAcceptedApplications] = useState([]);

    const rpsFileInputRef = useRef(null);
    const tsdFileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchAcceptedApplications();
        }
    }, [isOpen]);

    const fetchAcceptedApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/permits/getAllApplications?status=Accepted', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAcceptedApplications(response.data);
        } catch (error) {
            console.error('Error fetching accepted applications:', error);
            toast.error('Failed to fetch accepted applications');
        }
    };

    const handleApplicationSelect = (applicationId) => {
        const selectedApp = acceptedApplications.find(app => app._id === applicationId);
        if (selectedApp) {
            setFormData({
                ...formData,
                applicationId: selectedApp.customId || selectedApp._id,
                applicantName: selectedApp.ownerName || ''
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeeChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            fees: prev.fees.map(fee =>
                fee.id === id ? { ...fee, [field]: value } : fee
            )
        }));
    };

    const addFeeRow = () => {
        setFormData(prev => ({
            ...prev,
            fees: [...prev.fees, { id: Date.now(), legalBasis: '', description: '', amount: '' }]
        }));
    };

    const removeFeeRow = (id) => {
        setFormData(prev => ({
            ...prev,
            fees: prev.fees.filter(fee => fee.id !== id)
        }));
    };

    const handleSignatureUpload = (event, signatureType) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, [signatureType]: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = (e, inputRef) => {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current.click();
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleTimeChange = (newValue, field) => {
        setFormData(prev => ({ ...prev, [field]: newValue }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/api/admin/order-of-payments', formData, {
                headers: { Authorization: token }
            });
            toast.success('Order of Payment created successfully');
            onClose();
        } catch (error) {
            console.error('Error creating Order of Payment:', error);
            toast.error('Failed to create Order of Payment');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <Label htmlFor="applicationSelect">Select Application</Label>
                        <Select onValueChange={handleApplicationSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an application" />
                            </SelectTrigger>
                            <SelectContent>
                                {acceptedApplications.map((app) => (
                                    <SelectItem key={app._id} value={app._id}>
                                        {app.customId || app._id} - {app.ownerName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label htmlFor="applicationId">Application ID</Label>
                        <Input
                            id="applicationId"
                            name="applicationId"
                            value={formData.applicationId}
                            onChange={(e) => handleInputChange(e)}
                            disabled
                        />
                        <Label htmlFor="applicantName">Applicant Name</Label>
                        <Input
                            id="applicantName"
                            name="applicantName"
                            value={formData.applicantName}
                            onChange={(e) => handleInputChange(e)}
                            disabled
                        />
                    </>
                );
            case 2:
                return (
                    <div className="space-y-6 h-[630px] flex flex-col">
                        <div className="flex-grow overflow-auto custom-scrollbar pr-4">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="billNo">Bill No.</Label>
                                        <Input
                                            id="billNo"
                                            name="billNo"
                                            value={formData.billNo}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <Label>Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {format(formData.date, "MMM d, yyyy")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.date}
                                                    onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="namePayee">Name/Payee:</Label>
                                    <Input
                                        id="namePayee"
                                        name="namePayee"
                                        value={formData.namePayee}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Address:</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="natureOfApplication">Nature of Application/Permit/Documents being secured:</Label>
                                    <Input
                                        id="natureOfApplication"
                                        name="natureOfApplication"
                                        value={formData.natureOfApplication}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Legal Basis (DAO/SEC)</TableHead>
                                            <TableHead>Description and Computation of Fees and Charges Assessed</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.fees.map((fee, index) => (
                                            <TableRow key={fee.id}>
                                                <TableCell>
                                                    <Input
                                                        value={fee.legalBasis}
                                                        onChange={(e) => handleFeeChange(fee.id, 'legalBasis', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={fee.description}
                                                        onChange={(e) => handleFeeChange(fee.id, 'description', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={fee.amount}
                                                        onChange={(e) => handleFeeChange(fee.id, 'amount', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {index > 0 && (
                                                        <Button variant="ghost" size="icon" onClick={() => removeFeeRow(fee.id)}>
                                                            <MinusIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-between items-center">
                                    <Button variant="outline" onClick={addFeeRow} type="button">
                                        <PlusIcon className="h-4 w-4 mr-2" /> Add Row
                                    </Button>
                                    <div className="flex items-center">
                                        <Label className="mr-2">Total:</Label>
                                        <Input
                                            className="w-32"
                                            value={`₱ ${formData.fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0).toFixed(2)}`}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                {/* Signature upload section */}
                                <div className="grid grid-cols-2 gap-8 mt-8">
                                    <div className="text-center relative">
                                        <div className="h-24 mb-4">
                                            {formData.rpsSignature && (
                                                <img
                                                    src={formData.rpsSignature}
                                                    alt="RPS E-Signature"
                                                    className="max-w-full max-h-full mx-auto object-contain"
                                                />
                                            )}
                                        </div>
                                        <Input className="text-center font-semibold" defaultValue="SIMEON R. DIAZ" readOnly />
                                        <p className="text-xs mt-1">SVEMS/Chief, RPS</p>
                                        <input
                                            type="file"
                                            ref={rpsFileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleSignatureUpload(e, 'rpsSignature')}
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
                                        <div className="h-24 mb-4">
                                            {formData.tsdSignature && (
                                                <img
                                                    src={formData.tsdSignature}
                                                    alt="TSD E-Signature"
                                                    className="max-w-full max-h-full mx-auto object-contain"
                                                />
                                            )}
                                        </div>
                                        <Input className="text-center font-semibold" defaultValue="Engr. CYNTHIA U. LOZANO" readOnly />
                                        <p className="text-xs mt-1">Chief, Technical Services Division</p>
                                        <input
                                            type="file"
                                            ref={tsdFileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleSignatureUpload(e, 'tsdSignature')}
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
                                {/* Date and Time fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Date of payment of applicant:</Label>
                                        <div className="flex space-x-2 mt-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formData.paymentDate ? format(formData.paymentDate, "MMM d, yyyy") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.paymentDate}
                                                        onSelect={(date) => handleDateChange(date, 'paymentDate')}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <TimePicker
                                                className="w-[140px]"
                                                value={formData.paymentTime}
                                                onChange={(newValue) => handleTimeChange(newValue, 'paymentTime')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Date for statutory receipt by applicant:</Label>
                                        <div className="flex space-x-2 mt-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formData.receiptDate ? format(formData.receiptDate, "MMM d, yyyy") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.receiptDate}
                                                        onSelect={(date) => handleDateChange(date, 'receiptDate')}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <TimePicker
                                                className="w-[140px]"
                                                value={formData.receiptTime}
                                                onChange={(newValue) => handleTimeChange(newValue, 'receiptTime')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3>Review Order of Payment</h3>
                        <p>Application ID: {formData.applicationId}</p>
                        <p>Applicant Name: {formData.applicantName}</p>
                        <h4>Items:</h4>
                        <ul>
                            {formData.items.map((item, index) => (
                                <li key={index}>{item.description}: ₱{item.amount.toFixed(2)}</li>
                            ))}
                        </ul>
                        <p>Total Amount: ₱{formData.totalAmount.toFixed(2)}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={step === 2 ? "max-w-[800px] w-full" : ""}>
                <DialogHeader>
                    <DialogTitle>{application ? 'View Order of Payment' : 'Create Order of Payment'}</DialogTitle>
                    <DialogDescription>
                        Review the details of this Order of Payment.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    {renderStep()}
                    <DialogFooter>
                        {step > 1 && (
                            <Button type="button" onClick={() => setStep(step - 1)}>
                                Previous
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button type="button" onClick={() => setStep(step + 1)}>
                                Next
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleSubmit}>
                                {application ? 'Update' : 'Create'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OrderOfPaymentModal;
