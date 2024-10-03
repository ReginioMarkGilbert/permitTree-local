import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, Leaf, ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { CheckCircle } from "lucide-react";

const ChiefRPSorderOfPaymentPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [acceptedApplications, setAcceptedApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: '',
        dueDate: '',
        paymentFor: '',
    });
    const [eSignature, setESignature] = useState(null);

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
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setPaymentDetails(prev => ({ ...prev, dueDate: date }));
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
            const requiredFields = ['amount', 'dueDate', 'paymentFor'];
            const missingFields = requiredFields.filter(field => !paymentDetails[field]);
            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                value={paymentDetails.amount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!paymentDetails.dueDate && "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {paymentDetails.dueDate ? format(paymentDetails.dueDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={paymentDetails.dueDate}
                                        onSelect={handleDateChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label htmlFor="paymentFor">Payment For</Label>
                            <Input
                                id="paymentFor"
                                name="paymentFor"
                                value={paymentDetails.paymentFor}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </form>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="eSignature">Upload E-Signature</Label>
                            <div className="mt-2">
                                <label
                                    htmlFor="eSignature"
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer w-fit"
                                >
                                    <Upload className="h-4 w-4" />
                                    Choose File
                                </label>
                                <input
                                    id="eSignature"
                                    type="file"
                                    onChange={handleESignatureUpload}
                                    accept="image/*"
                                    className="hidden"
                                    required
                                />
                            </div>
                            {eSignature && (
                                <p className="mt-2 text-sm text-gray-600">
                                    File selected: {eSignature.name}
                                </p>
                            )}
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
