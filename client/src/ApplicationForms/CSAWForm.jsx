// Application for Chainsaw Registration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';

const CSAWForm = ({ selectedStore }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [fileNames, setFileNames] = useState(() => {
        // Load file names from sessionStorage
        const savedFileNames = sessionStorage.getItem('fileNames');
        return savedFileNames ? JSON.parse(savedFileNames) : [];
    });
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [dateOfAcquisition, setDateOfAcquisition] = useState('');
    const [powerOutput, setPowerOutput] = useState('');
    const [maxLengthGuidebar, setMaxLengthGuidebar] = useState('');
    const [countryOfOrigin, setCountryOfOrigin] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');

    useEffect(() => {
        // Save file names to sessionStorage whenever they change
        sessionStorage.setItem('fileNames', JSON.stringify(fileNames));
    }, [fileNames]);

    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            name,
            address,
            phone,
            brand,
            model,
            serialNumber,
            dateOfAcquisition,
            powerOutput,
            maxLengthGuidebar,
            countryOfOrigin,
            purchasePrice,
            fileNames,
            store: selectedStore // Ensure store is included in the form data
        };

        console.log('Form Data:', formData); // Log the form data

        try {
            const response = await fetch('http://localhost:3000/api/csaw_createApplication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Application submitted:', data);
                sessionStorage.removeItem('fileNames'); // Clear sessionStorage on successful submission
                navigate('/message'); // Navigate to the MessageBox component
            } else {
                console.error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-28 p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">Apply for Chainsaw Registration</h1>
            <form id="registrationForm" onSubmit={handleSubmit}>
                <div className="form-section mb-6">
                    <h4 className="text-lg font-medium mb-4">Owner Details</h4>
                    <div className="form-group mb-4">
                        <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="address" className="block text-gray-700 mb-2">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="Barangay, Bayan, Probinsya"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="e.g. 09123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                <div id="chainsaw-details" className="form-section mb-6">
                    <h4 className="text-lg font-medium mb-4">Chainsaw Details</h4>
                    <div className="form-group mb-4">
                        <label htmlFor="brand" className="block text-gray-700 mb-2">Brand</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            placeholder="Enter Brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            title="Brand can include letters and numbers"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="model" className="block text-gray-700 mb-2">Model</label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            placeholder="Enter Model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            title="Model can include letters and numbers"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="serialNumber" className="block text-gray-700 mb-2">Serial No.</label>
                        <input
                            type="text"
                            id="serialNumber"
                            name="serialNumber"
                            placeholder="Enter Serial Number"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            title="Serial Number can include letters and numbers"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="dateOfAcquisition" className="block text-gray-700 mb-2">Date of Acquisition</label>
                        <input
                            type="date"
                            id="dateOfAcquisition"
                            name="dateOfAcquisition"
                            value={dateOfAcquisition}
                            onChange={(e) => setDateOfAcquisition(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="powerOutput" className="block text-gray-700 mb-2">Power Output (kW/bhp)</label>
                        <input
                            type="text"
                            id="powerOutput"
                            name="powerOutput"
                            placeholder="e.g. 5 kW or 6.7 bhp"
                            title="Enter power output in kW or bhp"
                            value={powerOutput}
                            onChange={(e) => setPowerOutput(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="maxLengthGuidebar" className="block text-gray-700 mb-2">Maximum Length of Guidebar</label>
                        <input
                            type="text"
                            id="maxLengthGuidebar"
                            name="maxLengthGuidebar"
                            placeholder="e.g. 20 inches"
                            value={maxLengthGuidebar}
                            onChange={(e) => setMaxLengthGuidebar(e.target.value)}
                            title="Enter the maximum length of the guidebar"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="countryOfOrigin" className="block text-gray-700 mb-2">Country of Origin</label>
                        <input
                            type="text"
                            id="countryOfOrigin"
                            name="countryOfOrigin"
                            placeholder="Enter Country of Origin"
                            value={countryOfOrigin}
                            onChange={(e) => setCountryOfOrigin(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="purchasePrice" className="block text-gray-700 mb-2">Purchase Price</label>
                        <input
                            type="number"
                            id="purchasePrice"
                            name="purchasePrice"
                            placeholder="Enter Purchase Price"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            title="Enter the purchase price in local currency"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                <div className="form-actions flex items-center">
                    <FileUpload fileNames={fileNames} setFileNames={setFileNames} />
                    <button className="submit-button bg-green-500 text-white py-2 px-4 rounded ml-4 hover:bg-green-600" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default CSAWForm;
