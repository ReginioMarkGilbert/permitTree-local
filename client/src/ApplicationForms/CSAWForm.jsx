import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Download, X } from "lucide-react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import '../components/ui/styles/CSAWFormScrollbar.css';

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

const ChainsawRegistrationForm = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem('csawFormStep');
        return savedStep ? parseInt(savedStep, 10) : 0;
    });
    const [formData, setFormData] = useState(() => {
        const savedFormData = localStorage.getItem('csawFormData');
        return savedFormData ? JSON.parse(savedFormData) : {
            applicationType: 'Chainsaw Registration', // Set default application type
            registrationType: '', // New field for registration type
            chainsawStore: '',
            ownerName: '',
            address: '',
            phone: '',
            brand: '',
            model: '',
            serialNumber: '',
            dateOfAcquisition: '',
            powerOutput: '',
            maxLengthGuidebar: '',
            countryOfOrigin: '',
            purchasePrice: '',
            files: {
                officialReceipt: [],
                deedOfSale: [],
                specialPowerOfAttorney: [],
                forestTenureAgreement: [],
                businessPermit: [],
                certificateOfRegistration: [],
                woodProcessingPlantPermit: []
            },
            dateOfSubmission: '',
            status: '',
            isOwner: false,
            isTenureHolder: false,
            isBusinessOwner: false,
            isPLTPRHolder: false,
            isWPPHolder: false,
        };
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    const chainsawStores = [
        { value: "Green Chainsaw Co.", label: "Green Chainsaw Co." },
        { value: "Forest Tools Inc.", label: "Forest Tools Inc." },
        { value: "EcoSaw Supplies", label: "EcoSaw Supplies" },
        { value: "Timber Tech Equipment", label: "Timber Tech Equipment" },
        { value: "Woodland Machinery", label: "Woodland Machinery" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, documentType) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData(prev => ({
                ...prev,
                files: {
                    ...prev.files,
                    [documentType]: [...prev.files[documentType], ...newFiles]
                }
            }));
        }
    };

    const removeFile = (documentType, fileToRemove) => {
        setFormData(prev => ({
            ...prev,
            files: {
                ...prev.files,
                [documentType]: prev.files[documentType].filter(file => file !== fileToRemove)
            }
        }));
    };

    const handleNextStep = () => {
        if (currentStep === 0 && !formData.registrationType) {
            toast.error("Please select a registration type");
            return;
        }
        if (currentStep === 1 && !formData.chainsawStore) {
            toast.error("Please select a chainsaw store from the accredited list to proceed.");
            return;
        }
        if (currentStep === 4) {
            const requiredFields = [
                'ownerName',
                'address',
                'phone',
                'brand',
                'model',
                'serialNumber',
                'dateOfAcquisition',
                'powerOutput',
                'maxLengthGuidebar',
                'countryOfOrigin',
                'purchasePrice'
            ];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    toast.error("Please fill out all required fields to proceed.");
                    return;
                }
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSaveAsDraft = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentDate = new Date();
            const formDataToSend = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'files') {
                    Object.keys(formData[key]).forEach(docType => {
                        formData[key][docType].forEach(file => {
                            formDataToSend.append(`${docType}[]`, file);
                        });
                    });
                } else if (key !== 'status' && key !== 'dateOfSubmission') {
                    formDataToSend.append(key, formData[key]);
                }
            });
            formDataToSend.append('dateOfSubmission', currentDate.toISOString());
            formDataToSend.append('status', 'Draft');

            const response = await axios.post('http://localhost:3000/api/csaw_saveDraft', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token
                }
            });

            setModalContent({
                title: 'Draft saved successfully!',
                message: 'Do you want to view your applications?'
            });
            setModalOpen(true);
        } catch (error) {
            console.error('Error saving draft:', error);
            toast.error("Error saving draft");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Get the token from local storage
            if (!token) {
                toast.error("No authentication token found. Please log in.");
                return;
            }

            const currentDate = new Date();
            const formDataToSend = new FormData();

            // Append non-file fields
            Object.keys(formData).forEach(key => {
                if (key !== 'files') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append files
            Object.keys(formData.files).forEach(fileType => {
                formData.files[fileType].forEach(file => {
                    formDataToSend.append(fileType, file);
                });
            });

            formDataToSend.append('dateOfSubmission', currentDate.toISOString());
            formDataToSend.append('status', 'Submitted');

            // Log the form data
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await axios.post('http://localhost:3000/api/csaw_createApplication', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token // Include the token in the headers
                }
            });

            // Handle successful submission
            console.log('Application submitted:', response.data);
            setModalContent({
                title: 'Application submitted successfully!',
                message: 'Do you want to view your application?'
            });
            setModalOpen(true);

            // If submission is successful, clear localStorage
            localStorage.removeItem('csawFormStep');
            localStorage.removeItem('csawFormData');
        } catch (error) {
            console.error('Error submitting application:', error);

            // Enhanced error handling
            if (error.response && error.response.status === 401) {
                toast.error("Unauthorized: Please log in again.");
                // Optionally, redirect to login page or clear token
            } else {
                toast.error(`Error submitting application: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const steps = [
        { title: "Registration Type", description: "Choose registration type" },
        { title: "Accredited Chainsaw Store", description: "Select chainsaw store" },
        { title: "Document Requirements", description: "Specify document requirements" },
        { title: "Upload Documents", description: "Upload necessary documents" },
        { title: "Application Details", description: "Fill in application details" },
        { title: "Review  Your Application", description: "Review your application" },
    ];

    // Add a helper function to format the labels
    const formatLabel = (key) => {
        return key
            .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lower and upper case letters
            .replace(/\b(P L T P R|W P P)\b/g, match => match.replace(/ /g, '')) // Remove spaces in PLTPR and WPP
        // .replace(/\b(PLTPR|WPP)\b/g, match => `${match}`);
    };

    const CustomSelect = ({ value, onChange, options }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [width, setWidth] = useState('auto');
        const selectRef = useRef(null);
        const measureRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (selectRef.current && !selectRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        useEffect(() => {
            if (measureRef.current) {
                const longestOption = options.reduce((a, b) => a.label.length > b.label.length ? a : b);
                measureRef.current.textContent = longestOption.label;
                const width = measureRef.current.offsetWidth;
                setWidth(`${width + 40}px`); // Add some padding
            }
        }, [options]);

        return (
            <div ref={selectRef} className="relative" style={{ width }}>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                    {value ? options.find(opt => opt.value === value)?.label : "Select a store"}
                    <ChevronDownIcon className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                </div>
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-popover rounded-md border shadow-md">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            >
                                {option.label}
                                {value === option.value && (
                                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <CheckIcon className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <span ref={measureRef} className="absolute opacity-0 pointer-events-none whitespace-nowrap" />
            </div>
        );
    };

    const uploadCardsCount = Object.values(formData).filter(value => value === true).length;
    const isScrollable = uploadCardsCount > 3;

    useEffect(() => {
        localStorage.setItem('csawFormStep', currentStep.toString());
    }, [currentStep]);

    useEffect(() => {
        localStorage.setItem('csawFormData', JSON.stringify(formData));
    }, [formData]);

    return (
        <div className="min-h-screen bg-green-50 flex flex-col justify-between pt-[83px]">
            <div className="container mx-auto px-4 flex-grow">
                <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Chainsaw Registration Application</h1>
                <Card className="max-w-2xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle>{steps[currentStep].title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            {currentStep === 0 && (
                                <div className="space-y-6 pb-4">
                                    <RadioGroup
                                        onValueChange={(value) => handleSelectChange('registrationType', value)}
                                        value={formData.registrationType}
                                    >
                                        <div className="flex items-center space-x-2 pt-8">
                                            <RadioGroupItem value="New" id="new" className="w-12 h-12" />
                                            <Label htmlFor="new" className="text-lg font-semibold">New Registration</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-1">
                                            <RadioGroupItem value="Renewal" id="renewal" className="w-12 h-12" />
                                            <Label htmlFor="renewal" className="text-lg font-semibold">Renewal</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-4 pt-2">
                                    <p className="text-sm text-gray-700 mb-3 font-semibold">
                                        Please select the store where you purchased your chainsaw. You cannot proceed if your chainsaw was not purchased from one of the accredited stores.
                                    </p>
                                    <CustomSelect
                                        value={formData.chainsawStore}
                                        onChange={(value) => handleSelectChange('chainsawStore', value)}
                                        options={chainsawStores}
                                    />
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-700 mb-4 font-semibold">
                                        Please check the boxes that apply to you. In the next step, you will be required to upload the corresponding documents.
                                    </p>
                                    <div className="space-y-2">
                                        <CheckboxItem
                                            id="isOwner"
                                            label="Are you the owner of the Chainsaw?"
                                            checked={formData.isOwner}
                                            onChange={handleCheckboxChange}
                                        />
                                        <CheckboxItem
                                            id="isTenureHolder"
                                            label="Are you a Tenure holder?"
                                            checked={formData.isTenureHolder}
                                            onChange={handleCheckboxChange}
                                        />
                                        <CheckboxItem
                                            id="isBusinessOwner"
                                            label="Are you a business owner?"
                                            checked={formData.isBusinessOwner}
                                            onChange={handleCheckboxChange}
                                        />
                                        <CheckboxItem
                                            id="isPLTPRHolder"
                                            label="Are you a Private Land Tree Plantation Registration (PLTPR) holder?"
                                            checked={formData.isPLTPRHolder}
                                            onChange={handleCheckboxChange}
                                        />
                                        <CheckboxItem
                                            id="isWPPHolder"
                                            label="Are you a Licensed Wood Processor/Wood Processing Plant (WPP) holder?"
                                            checked={formData.isWPPHolder}
                                            onChange={handleCheckboxChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="step-3-container">
                                    <p className="text-sm text-gray-700 mb-4 font-semibold">
                                        Please upload the required documents.
                                    </p>
                                    <div className="upload-cards-container csaw-form-scrollbar">
                                        <UploadCard
                                            label="Official Receipt of Chainsaw Purchase"
                                            documentLabel="Upload 1 certified copy and 1 original for verification (or Affidavit of Ownership if original is lost)"
                                            files={formData.files.officialReceipt}
                                            onFileChange={(e) => handleFileChange(e, 'officialReceipt')}
                                            onRemoveFile={(file) => removeFile('officialReceipt', file)}
                                        />
                                        <UploadCard
                                            label="Notarized Deed of Absolute Sale"
                                            documentLabel="Upload 1 original (required if transfer of ownership)"
                                            files={formData.files.deedOfSale}
                                            onFileChange={(e) => handleFileChange(e, 'deedOfSale')}
                                            onRemoveFile={(file) => removeFile('deedOfSale', file)}
                                        />
                                        {!formData.isOwner && (
                                            <UploadCard
                                                label="Special Power of Attorney"
                                                documentLabel="Upload document if you are not the owner of the Chainsaw"
                                                files={formData.files.specialPowerOfAttorney}
                                                onFileChange={(e) => handleFileChange(e, 'specialPowerOfAttorney')}
                                                onRemoveFile={(file) => removeFile('specialPowerOfAttorney', file)}
                                            />
                                        )}
                                        {formData.isTenureHolder && (
                                            <UploadCard
                                                label="Forest Tenure Agreement"
                                                documentLabel="Upload certified True copy of forest Tenure Agreement"
                                                files={formData.files.forestTenureAgreement}
                                                onFileChange={(e) => handleFileChange(e, 'forestTenureAgreement')}
                                                onRemoveFile={(file) => removeFile('forestTenureAgreement', file)}
                                            />
                                        )}
                                        {formData.isBusinessOwner && (
                                            <UploadCard
                                                label="Business Permit"
                                                documentLabel="Upload Business Permit"
                                                files={formData.files.businessPermit}
                                                onFileChange={(e) => handleFileChange(e, 'businessPermit')}
                                                onRemoveFile={(file) => removeFile('businessPermit', file)}
                                            />
                                        )}
                                        {formData.isPLTPRHolder && (
                                            <UploadCard
                                                label="Certificate of Registration"
                                                documentLabel="Upload Certificate of Registration for Private Land Tree Plantation Registration (PLTPR)"
                                                files={formData.files.certificateOfRegistration}
                                                onFileChange={(e) => handleFileChange(e, 'certificateOfRegistration')}
                                                onRemoveFile={(file) => removeFile('certificateOfRegistration', file)}
                                            />
                                        )}
                                        {formData.isWPPHolder && (
                                            <UploadCard
                                                label="Wood Processing Plant Permit"
                                                documentLabel="Upload Wood Processing Plant Permit"
                                                files={formData.files.woodProcessingPlantPermit}
                                                onFileChange={(e) => handleFileChange(e, 'woodProcessingPlantPermit')}
                                                onRemoveFile={(file) => removeFile('woodProcessingPlantPermit', file)}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-4">
                                    {/* <h3 className="text-lg font-semibold mb-2 text-green-700">Application Details</h3> */}
                                    <div className="space-y-5 h-[600px]">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1 text-green-700">Owner Details</h3>
                                            <div className="space-y-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ownerName">Name</Label>
                                                    <Input
                                                        id="ownerName"
                                                        name="ownerName"
                                                        value={formData.ownerName}
                                                        onChange={handleInputChange}
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        placeholder="Barangay, Bayan, Probinsya"
                                                        required
                                                        autoComplete="street-address"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. 09123456789"
                                                        required
                                                        autoComplete="tel"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2 text-green-700">Chainsaw Details</h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="brand">Brand</Label>
                                                        <Input
                                                            id="brand"
                                                            name="brand"
                                                            value={formData.brand}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter Brand"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="model">Model</Label>
                                                        <Input
                                                            id="model"
                                                            name="model"
                                                            value={formData.model}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter Model"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="serialNumber">Serial No.</Label>
                                                        <Input
                                                            id="serialNumber"
                                                            name="serialNumber"
                                                            value={formData.serialNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter Serial Number"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="dateOfAcquisition">Date of Acquisition</Label>
                                                        <Input
                                                            id="dateOfAcquisition"
                                                            name="dateOfAcquisition"
                                                            type="date"
                                                            value={formData.dateOfAcquisition}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="powerOutput">Power Output (kW/bhp)</Label>
                                                        <Input
                                                            id="powerOutput"
                                                            name="powerOutput"
                                                            value={formData.powerOutput}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g. 5 kW or 6.7 bhp"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="maxLengthGuidebar">Maximum Length of Guidebar (Inches)</Label>
                                                        <Input
                                                            id="maxLengthGuidebar"
                                                            name="maxLengthGuidebar"
                                                            value={formData.maxLengthGuidebar}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g. 20 inches"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                                                        <Input
                                                            id="countryOfOrigin"
                                                            name="countryOfOrigin"
                                                            value={formData.countryOfOrigin}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter Country of Origin"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="purchasePrice">Purchase Price</Label>
                                                        <Input
                                                            id="purchasePrice"
                                                            name="purchasePrice"
                                                            type="number"
                                                            value={formData.purchasePrice}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter Purchase Price"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && ( // Review Your Application
                                <div className="space-y-6 h-[630px] flex flex-col">
                                    {/* <h3 className="text-xl font-semibold mb-4 text-green-700">Review Your Application</h3> */}
                                    <div className="review-step-container csaw-form-scrollbar flex-grow overflow-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(formData)
                                                .filter(([key]) => key !== 'status' && key !== 'dateOfSubmission' && key !== 'files')
                                                .map(([key, value]) => (
                                                    <div key={key} className="bg-white p-3 rounded-lg shadow">
                                                        <h4 className="font-semibold text-green-600 mb-1 text-sm">{formatLabel(key)}</h4>
                                                        <p className="text-gray-700 text-sm">
                                                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>

                                        <div className="bg-white p-3 rounded-lg shadow mt-4">
                                            <h4 className="font-semibold text-green-600 mb-2 text-sm">Uploaded Files</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {Object.entries(formData.files).map(([docType, files]) => (
                                                    <div key={docType} className="border-b pb-2">
                                                        <h5 className="font-medium text-gray-700 mb-1 text-xs">{formatLabel(docType)}</h5>
                                                        {files.length > 0 ? (
                                                            <ul className="list-disc list-inside">
                                                                {files.map((file, index) => (
                                                                    <li key={index} className="text-xs text-gray-600">{file.name}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs text-gray-500">No files uploaded</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:w-auto">
                            {currentStep > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    className="w-full sm:w-auto"
                                >
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                            {currentStep < steps.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Next
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveAsDraft}
                                        className="w-full sm:w-auto"
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button
                                        type="submit"
                                        onClick={handleSubmit}
                                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Submit Application
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <ToastContainer />
            <Modal
                isOpen={modalOpen}
                title={modalContent.title}
                message={modalContent.message}
                onClose={() => setModalOpen(false)}
                onHome={() => navigate('/')}
                onApplications={() => navigate('/applicationsStatus')}
            />
        </div>
    );
};

const CheckboxItem = ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            id={id}
            name={id}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {label}
        </label>
    </div>
);

const UploadCard = ({ label, documentLabel, files, onFileChange, onRemoveFile }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
                <span className="font-medium">{label}</span>
            </div>
            <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{documentLabel}</label>
                <div className="space-y-4">
                    <div className="mb-6">
                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor={`file-upload-${label}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer w-fit"
                            >
                                <Download className="h-4 w-4" />
                                Choose Files
                            </label>
                            <input
                                id={`file-upload-${label}`}
                                type="file"
                                className="hidden"
                                onChange={onFileChange}
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf,.docx"
                            />
                            {files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveFile(file)}
                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {files.length === 0 && (
                                <p className="text-sm text-gray-500">No files chosen</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChainsawRegistrationForm;
