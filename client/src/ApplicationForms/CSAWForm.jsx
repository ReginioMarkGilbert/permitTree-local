// Application for Chainsaw Registration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CSAWForm.css';
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
            store: selectedStor
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
        <div className="form-container">
            <h1>Apply for Chainsaw Registration</h1>
            <form id="registrationForm" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4 className='form-title'>Owner Details</h4>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="Barangay, Bayan, Probinsya"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="e.g. 09123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div id="chainsaw-details" className="form-section">
                    <h4 className='form-title'>Chainsaw Details</h4>
                    <div className="form-group">
                        <label htmlFor="brand">Brand</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            placeholder="Enter Brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            title="Brand can include letters and numbers"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="model">Model</label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            placeholder="Enter Model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            title="Model can include letters and numbers"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="serialNumber">Serial No.</label>
                        <input
                            type="text"
                            id="serialNumber"
                            name="serialNumber"
                            placeholder="Enter Serial Number"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            title="Serial Number can include letters and numbers"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateOfAcquisition">Date of Acquisition</label>
                        <input
                            type="date"
                            id="dateOfAcquisition"
                            name="dateOfAcquisition"
                            value={dateOfAcquisition}
                            onChange={(e) => setDateOfAcquisition(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="powerOutput">Power Output (kW/bhp)</label>
                        <input
                            type="text"
                            id="powerOutput"
                            name="powerOutput"
                            placeholder="e.g. 5 kW or 6.7 bhp"
                            title="Enter power output in kW or bhp"
                            value={powerOutput}
                            onChange={(e) => setPowerOutput(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maxLengthGuidebar">Maximum Length of Guidebar</label>
                        <input
                            type="text"
                            id="maxLengthGuidebar"
                            name="maxLengthGuidebar"
                            placeholder="e.g. 20 inches"
                            value={maxLengthGuidebar}
                            onChange={(e) => setMaxLengthGuidebar(e.target.value)}
                            title="Enter the maximum length of the guidebar"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="countryOfOrigin">Country of Origin</label>
                        <input
                            type="text"
                            id="countryOfOrigin"
                            name="countryOfOrigin"
                            placeholder="Enter Country of Origin"
                            value={countryOfOrigin}
                            onChange={(e) => setCountryOfOrigin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="purchasePrice">Purchase Price</label>
                        <input
                            type="number"
                            id="purchasePrice"
                            name="purchasePrice"
                            placeholder="Enter Purchase Price"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            title="Enter the purchase price in local currency"
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <FileUpload fileNames={fileNames} setFileNames={setFileNames} />
                    <button className="submit-button" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default CSAWForm;
