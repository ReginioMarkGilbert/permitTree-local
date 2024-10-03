import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Leaf, ArrowLeft, ArrowRight, Upload, PlusIcon, MinusIcon } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import "@/components/ui/styles/customScrollbar.css";
import { UploadIcon } from 'lucide-react';
import { TimePicker } from "@/components/ui/time-picker";
import { formatLabel, formatReviewValue } from "@/lib/utils"; // Make sure you have these utility functions

const ChiefRPSorderOfPaymentPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [acceptedApplications, setAcceptedApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
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
    const [eSignature, setESignature] = useState(null);
    const [billDate, setBillDate] = useState(new Date());
    const [paymentDate, setPaymentDate] = useState(null);
    const [receiptDate, setReceiptDate] = useState(null);
    const [rpsSignature, setRpsSignature] = useState(null);
    const [tsdSignature, setTsdSignature] = useState(null);
    const rpsNameRef = useRef(null);
    const tsdNameRef = useRef(null);
    const rpsFileInputRef = useRef(null);
    const tsdFileInputRef = useRef(null);

    useEffect(() => {
        fetchAcceptedApplications();
    }, []);

    const fetchAcceptedApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/permits/getAllApplications?status=Accepted', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Fetched applications:', response.data);
            setAcceptedApplications(response.data);
        } catch (error) {
            console.error('Error fetching accepted applications:', error);
            toast.error('Failed to fetch accepted applications');
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

    const handleESignatureUpload = (e) => {
        const file = e.target.files[0];
        setESignature(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('applicationId', selectedApplication._id);
            formData.append('amount', paymentDetails.amount);
            formData.append('dueDate', paymentDetails.dueDate);
            formData.append('paymentFor', paymentDetails.paymentFor);
            formData.append('eSignature', eSignature);

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/orderOfPayment/create', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Order of Payment created and saved successfully');
            navigate('/chief-rps-dashboard');
        } catch (error) {
            console.error('Error creating Order of Payment:', error);
            toast.error('Failed to create Order of Payment');
        }
    };

    const handleNextStep = () => {
        if (currentStep === 0 && !selectedApplicationId) {
            toast.error("Please select an application");
            return;
        }
        if (currentStep === 1) {
            const requiredFields = ['billNo', 'namePayee', 'address', 'natureOfApplication'];
            const missingFields = requiredFields.filter(field => !formData[field]);

            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            if (formData.fees.length === 0 || formData.fees.some(fee => !fee.legalBasis || !fee.description || !fee.amount)) {
                toast.error("Please fill in all fee details");
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleApplicationSelect = (appId) => {
        console.log('Selecting application:', appId);
        setSelectedApplicationId(appId);
        const selectedApp = acceptedApplications.find(app => app._id === appId);
        setSelectedApplication(selectedApp);
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

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Select an Application</h2>
                        {acceptedApplications.map((app) => (
                            <div
                                key={app._id}
                                className={`cursor-pointer p-4 border rounded-lg ${selectedApplicationId === app._id ? 'border-2 border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                onClick={() => handleApplicationSelect(app._id)}
                            >
                                <p className="font-medium">{app.customId}</p>
                                <p className="text-sm text-gray-600">{app.ownerName}</p>
                                {selectedApplicationId === app._id && (
                                    <CheckCircle className="text-green-500 h-6 w-6 mt-2" />
                                )}
                            </div>
                        ))}
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6 h-[630px] flex flex-col">
                        {/* <h2 className="text-xl font-semibold">Fill Order of Payment Details</h2> */}
                        {/* <p className="text-center mb-4 text-sm">(SPLTP/  PLTP/ Clearance to cut/ Certification/ WRP/TCP)</p> */}
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
            case 2:
                return (
                    <div className="space-y-6 h-[630px] flex flex-col">
                        <h2 className="text-xl font-semibold">Review Order of Payment Details</h2>
                        <div className="review-step-container custom-scrollbar flex-grow overflow-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(formData)
                                    .filter(([key, value]) =>
                                        !['rpsSignature', 'tsdSignature', 'fees'].includes(key) &&
                                        value !== null &&
                                        value !== undefined
                                    )
                                    .map(([key, value]) => (
                                        <div key={key} className="bg-white p-3 rounded-lg shadow">
                                            <h4 className="font-semibold text-green-600 mb-1 text-sm">{formatLabel(key)}</h4>
                                            <p className="text-gray-700 text-sm">
                                                {formatReviewValue(key, value)}
                                            </p>
                                        </div>
                                    ))}
                            </div>

                            <div className="bg-white p-3 rounded-lg shadow mt-4">
                                <h4 className="font-semibold text-green-600 mb-2 text-sm">Fees</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {formData.fees && formData.fees.map((fee, index) => (
                                        <div key={index} className="border-b pb-2">
                                            <h5 className="font-medium text-gray-700 mb-1 text-xs">Fee {index + 1}</h5>
                                            <p className="text-xs text-gray-600">Legal Basis: {fee.legalBasis || 'Not provided'}</p>
                                            <p className="text-xs text-gray-600">Description: {fee.description || 'Not provided'}</p>
                                            <p className="text-xs text-gray-600">Amount: {fee.amount ? `₱${fee.amount}` : 'Not provided'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg shadow mt-4">
                                <h4 className="font-semibold text-green-600 mb-2 text-sm">Signatures</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-medium text-gray-700 mb-1 text-xs">RPS Signature</h5>
                                        {formData.rpsSignature ? (
                                            <img src={formData.rpsSignature} alt="RPS Signature" className="max-w-full h-24 object-contain" />
                                        ) : (
                                            <p className="text-xs text-gray-500">No signature uploaded</p>
                                        )}
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-700 mb-1 text-xs">TSD Signature</h5>
                                        {formData.tsdSignature ? (
                                            <img src={formData.tsdSignature} alt="TSD Signature" className="max-w-full h-24 object-contain" />
                                        ) : (
                                            <p className="text-xs text-gray-500">No signature uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleSubmit} className="w-full">Save Order of Payment</Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-green-50">
            <nav className="bg-white shadow-md z-10 flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <Leaf className="h-8 w-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-800">PermitTree</span>
                </div>
            </nav>

            <div className="container mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-3xl font-bold mb-6 text-green-800">Create Order of Payment</h1>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Step {currentStep + 1} of 3</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderStep()}
                    </CardContent>
                </Card>

                <div className="flex justify-between mt-6">
                    {currentStep > 0 && (
                        <Button onClick={handlePreviousStep} variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                    )}
                    <Button onClick={handleNextStep} className="ml-auto">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChiefRPSorderOfPaymentPage;
