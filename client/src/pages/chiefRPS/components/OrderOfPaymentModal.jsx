import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';
import axios from 'axios';

const OrderOfPaymentModal = ({ isOpen, onClose, application }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        applicationId: '',
        applicantName: '',
        items: [{ description: '', amount: 0 }],
        totalAmount: 0
    });
    const [acceptedApplications, setAcceptedApplications] = useState([]);

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

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        if (name === 'description' || name === 'amount') {
            const newItems = [...formData.items];
            newItems[index][name] = name === 'amount' ? parseFloat(value) : value;
            setFormData(prevState => ({
                ...prevState,
                items: newItems,
                totalAmount: newItems.reduce((sum, item) => sum + (item.amount || 0), 0)
            }));
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const addItem = () => {
        setFormData(prevState => ({
            ...prevState,
            items: [...prevState.items, { description: '', amount: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prevState => {
            const newItems = prevState.items.filter((_, i) => i !== index);
            return {
                ...prevState,
                items: newItems,
                totalAmount: newItems.reduce((sum, item) => sum + (item.amount || 0), 0)
            };
        });
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
                    <>
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <Input
                                    name="description"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                                <Input
                                    name="amount"
                                    type="number"
                                    placeholder="Amount"
                                    value={item.amount}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                                <Button type="button" onClick={() => removeItem(index)}>Remove</Button>
                            </div>
                        ))}
                        <Button type="button" onClick={addItem}>Add Item</Button>
                        <div className="mt-4">
                            <Label>Total Amount</Label>
                            <Input value={formData.totalAmount.toFixed(2)} disabled />
                        </div>
                    </>
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{application ? 'View Order of Payment' : 'Create Order of Payment'}</DialogTitle>
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
