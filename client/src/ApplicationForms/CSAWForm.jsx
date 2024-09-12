import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { toast } from '../components/ui/useToast';

const ChainsawRegistrationForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        applicationType: '',
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
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => {
        if (currentStep === 0 && !formData.applicationType) {
            toast({
                title: "Please select an application type",
                description: "Choose either New or Renewal to proceed.",
                variant: "error",
            });
            return;
        }
        if (currentStep === 1 && !formData.chainsawStore) {
            toast({
                title: "Please select a chainsaw store",
                description: "Choose an accredited chainsaw store to proceed.",
                variant: "error",
            });
            return;
        }
        if (currentStep === 2) {
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
                    toast({
                        title: "Incomplete Form",
                        description: "Please fill out all required fields to proceed.",
                        variant: "error",
                    });
                    return;
                }
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        toast({
            title: "Application Submitted",
            description: "Your chainsaw registration application has been submitted successfully.",
        });
    };

    const handleSaveAsDraft = () => {
        console.log("Saving as draft:", formData);
        toast({
            title: "Application Saved as Draft",
            description: "Your application has been saved to the Draft List/Page.",
            variant: "default",
        });
    };

    const steps = [
        { title: "Registration Type", description: "Choose registration type" },
        { title: "Chainsaw Store", description: "Select chainsaw store" },
        { title: "Application Details", description: "Fill in application details" },
        { title: "Review", description: "Review your application" },
    ];

    return (
        <div className="min-h-screen bg-green-50 flex items-start justify-center pt-20">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Chainsaw Registration Application</h1>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>{steps[currentStep].title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            {currentStep === 0 && (
                                <div className="space-y-6 pb-4">
                                    <RadioGroup
                                        onValueChange={(value) => handleSelectChange('applicationType', value)}
                                        value={formData.applicationType}
                                    >
                                        <div className="flex items-center space-x-2 pt-8">
                                            <RadioGroupItem value="New" id="new" className="w-12 h-12" />
                                            <Label htmlFor="New" className="text-lg font-semibold">New Registration</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-1">
                                            <RadioGroupItem value="renewal" id="renewal" className="w-12 h-12" />
                                            <Label htmlFor="renewal" className="text-lg font-semibold">Renewal</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-4 pt-8 h-36">
                                    <Label htmlFor="chainsawStore" className="text-lg font-semibold">Accredited Chainsaw Store</Label>
                                    <select
                                        id="chainsawStore"
                                        name="chainsawStore"
                                        value={formData.chainsawStore}
                                        onChange={(e) => handleSelectChange('chainsawStore', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="" disabled>Select a store</option>
                                        <option value="store1">Green Chainsaw Co.</option>
                                        <option value="store 2">Forest Tools Inc.</option>
                                        <option value="store3">EcoSaw Supplies</option>
                                        <option value="store4">Timber Tech Equipment</option>
                                        <option value="store5">Woodland Machinery</option>
                                    </select>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-5 h-[630px]">
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
                                                    className="w-48 h-16 resize-none"
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
                                                    <Label htmlFor="maxLengthGuidebar">Maximum Length of Guidebar</Label>
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
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-2 text-green-700">Review Your Application</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(formData).map(([key, value]) => (
                                            <div key={key} className="space-y-1">
                                                <Label className="font-semibold">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                                                <p className="text-gray-700">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="mt-4">
                        {currentStep > 0 && (
                            <Button type="button" variant="outline" onClick={handlePrevStep}>
                                Previous
                            </Button>
                        )}
                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={handleNextStep} className="bg-green-600 hover:bg-green-700 text-white">
                                Next
                            </Button>
                        ) : (
                            <div className="space-x-2">
                                <Button type="button" variant="outline" onClick={handleSaveAsDraft}>
                                    Save as Draft
                                </Button>
                                <Button type="submit" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                                    Submit Application
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ChainsawRegistrationForm;
