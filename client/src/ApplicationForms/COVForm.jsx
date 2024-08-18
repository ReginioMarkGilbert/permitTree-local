// Chainsaw Overhaul Registration Form
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ApplicationForm.css';
import uploadIcon from '../assets/upload_icn.svg';
import closeIcon from '../assets/close_icn.svg';

const COVForm = ({ selectedStore }) => {
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

    useEffect(() => {
        // Save file names to sessionStorage whenever they change
        sessionStorage.setItem('fileNames', JSON.stringify(fileNames));
    }, [fileNames]);

    const navigate = useNavigate(); // Initialize navigate

    const handleFileChange = (event) => {
        const newFiles = event.target.files;
        const newFileNamesArray = Array.from(newFiles).map(file => file.name);

        // Check for duplicate file names
        const duplicateFiles = newFileNamesArray.filter(fileName => fileNames.includes(fileName));
        if (duplicateFiles.length > 0) {
            alert(`The following files are duplicates and will not be uploaded: ${duplicateFiles.join(', ')}`);
            return;
        }

        if (fileNames.length + newFileNamesArray.length > 5) {
            alert("You can only upload a maximum of 5 files.");
            return;
        }

        setFileNames(prevFileNames => [...prevFileNames, ...newFileNamesArray]);
    };

    const handleRemoveFile = (fileNameToRemove) => {
        setFileNames(prevFileNames => prevFileNames.filter(fileName => fileName !== fileNameToRemove));
    };

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
        <div className="form-container">
            <h3>Apply for Chainsaw Registration</h3>
            <form id="registrationForm" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4 className='form-title'>Owner Details</h4>
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

                <div id="chainsaw-details" className="form-section">
                    <h4 className='form-title'>Chainsaw Details</h4>
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

                    <label htmlFor="dateOfAcquisition">Date of Acquisition</label>
                    <input
                        type="date"
                        id="dateOfAcquisition"
                        name="dateOfAcquisition"
                        value={dateOfAcquisition}
                        onChange={(e) => setDateOfAcquisition(e.target.value)}
                        required
                    />

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

                <div className="file-upload-container">
                    <label className='label-file'>Upload image/s of requirements</label>
                    <input
                        type="file"
                        id="fileUpload"
                        name="fileUpload"
                        accept="image/*,.pdf,.docx,.svg"
                        multiple
                        onChange={handleFileChange}
                        max="5" // Maximum number of files
                    />
                    <button
                        className="file-upload-label"
                        type="button"
                        onClick={() => document.getElementById('fileUpload').click()}
                    >
                        <img src={uploadIcon} alt="Upload Icon"/>
                        Add file
                    </button>
                </div>
                <div id="form_fileNames" className="form_file-names">
                    {fileNames.map((fileName, index) => (
                        <div key={index} className="form_file-name">
                            {fileName}
                            <button
                                type="button"
                                className="formRemove-file-button"
                                onClick={() => handleRemoveFile(fileName)}
                            >
                                <img className='remove-file-icon' src={closeIcon} alt="Close Icon" />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default COVForm;
