import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';

const ChiefRPSorderOfPaymentPage = () => {
    const navigate = useNavigate();
    const [acceptedApplications, setAcceptedApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: '',
        dueDate: '',
        paymentFor: '',
    });

    useEffect(() => {
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

        fetchAcceptedApplications();
    }, []);

    const handleApplicationSelect = (applicationId) => {
        const selected = acceptedApplications.find(app => app._id === applicationId);
        setSelectedApplication(selected);
        setPaymentDetails(prev => ({
            ...prev,
            paymentFor: `${selected.applicationType} Fee`
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedApplication) {
            toast.error('Please select an application');
            return;
        }
        try {
            await axios.post(`http://localhost:3000/api/order-of-payment/${selectedApplication._id}`, paymentDetails);
            toast.success('Order of Payment created successfully');
            navigate('/chief-rps/dashboard');
        } catch (error) {
            console.error('Error creating order of payment:', error);
            toast.error('Failed to create Order of Payment');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Create Order of Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="applicationSelect">Select Application</Label>
                            <Select onValueChange={handleApplicationSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an application" />
                                </SelectTrigger>
                                <SelectContent>
                                    {acceptedApplications.map(app => (
                                        <SelectItem key={app._id} value={app._id}>
                                            {app.customId} - {app.applicationType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedApplication && (
                            <>
                                <div className="mb-4">
                                    <Label htmlFor="applicantName">Applicant Name</Label>
                                    <Input id="applicantName" value={selectedApplication.ownerName} disabled />
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="applicationType">Application Type</Label>
                                    <Input id="applicationType" value={selectedApplication.applicationType} disabled />
                                </div>
                                <div className="mb-4">
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
                                <div className="mb-4">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        name="dueDate"
                                        type="date"
                                        value={paymentDetails.dueDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="paymentFor">Payment For</Label>
                                    <Input
                                        id="paymentFor"
                                        name="paymentFor"
                                        value={paymentDetails.paymentFor}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <Button type="submit">Create Order of Payment</Button>
                            </>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChiefRPSorderOfPaymentPage;
