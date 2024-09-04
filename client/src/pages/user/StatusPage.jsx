import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdateForm from './UpdateForm';
import backHome from '../../assets/back_home.svg';
import refreshIcon from '../../assets/refresh_page_icn.svg';
import '../../styles/StatusPage.css';

// const StatusPage = ({ applicationId }) => {
const StatusPage = () => {
    const [applications, setApplications] = useState([]);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [newModel, setNewModel] = useState('');
    const [newSerialNumber, setNewSerialNumber] = useState('');
    const [newDateOfAcquisition, setNewDateOfAcquisition] = useState('');
    const [newPowerOutput, setNewPowerOutput] = useState('');
    const [newFileNames, setNewFileNames] = useState([]);
    const [newStore, setNewStore] = useState('');

    const navigate = useNavigate(); // Initialize navigate using useNavigate hook

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/getApplications');
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched applications:', data);
                setApplications(data);
            } else {
                console.error('Failed to fetch applications', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpdateClick = (application) => {
        setSelectedApplication(application);
        setNewName(application.name);
        setNewAddress(application.address);
        setNewPhone(application.phone);
        setNewBrand(application.brand);
        setNewModel(application.model);
        setNewSerialNumber(application.serialNumber);
        setNewDateOfAcquisition(application.dateOfAcquisition);
        setNewPowerOutput(application.powerOutput);
        setNewFileNames(application.fileNames || []);
        setNewStore(application.store);
        setShowUpdateForm(true);
    };

    const handleUpdateSubmit = async (event) => {
        event.preventDefault();

        const updatedApplication = {
            name: newName,
            address: newAddress,
            phone: newPhone,
            brand: newBrand,
            model: newModel,
            serialNumber: newSerialNumber,
            dateOfAcquisition: newDateOfAcquisition,
            powerOutput: newPowerOutput,
            fileNames: newFileNames,
            store: newStore,
        };

        try {
            const response = await fetch(`http://localhost:5000/api/updateApplication/${selectedApplication._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedApplication),
            });

            if (response.ok) {
                await fetchApplications();
                setShowUpdateForm(false);
                setSelectedApplication(null);
            } else {
                console.error('Failed to update application', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteClick = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/deleteApplication/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchApplications();
            } else {
                console.error('Failed to delete application', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRefreshClick = () => {
        fetchApplications();
    };

    const handleHomeClick = () => {
        navigate('/'); // Navigate to the home page
    };


    return (
        <div className="status-page">
            <div className="icon-container">
                <div className="home-button" onClick={handleHomeClick}>
                    <img src={backHome} alt="Home" />
                </div>
                <img src={refreshIcon} alt="Refresh" className="status-refresh-icon" onClick={handleRefreshClick} />
            </div>
            <h2>Application Status</h2>
            <table>
                <thead>
                    <tr>
                        <th>Application Type</th>
                        <th>Application ID</th>
                        <th>Date Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map(application => (
                        <tr key={application._id}>
                            <td>Chainsaw Application</td>
                            <td>{application.customId}</td>
                            <td>
                                {new Date(application.dateOfSubmission).toLocaleDateString()} | {
                                    new Date(application.dateOfSubmission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </td>
                            <td className="status-cell">
                                <span className={`status ${application.status.toLowerCase().replace(' ', '-')}`}>{application.status}</span>
                            </td>
                            <td>
                                <button className='update_button' onClick={() => handleUpdateClick(application)}>Update Form</button>
                                <button className='delete_button' onClick={() => handleDeleteClick(application._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showUpdateForm && (
                <UpdateForm
                    newName={newName}
                    setNewName={setNewName}
                    newAddress={newAddress}
                    setNewAddress={setNewAddress}
                    newPhone={newPhone}
                    setNewPhone={setNewPhone}
                    newBrand={newBrand}
                    setNewBrand={setNewBrand}
                    newModel={newModel}
                    setNewModel={setNewModel}
                    newSerialNumber={newSerialNumber}
                    setNewSerialNumber={setNewSerialNumber}
                    newDateOfAcquisition={newDateOfAcquisition}
                    setNewDateOfAcquisition={setNewDateOfAcquisition}
                    newPowerOutput={newPowerOutput}
                    setNewPowerOutput={setNewPowerOutput}
                    newFileNames={newFileNames}
                    setNewFileNames={setNewFileNames}
                    newStore={newStore}
                    setNewStore={setNewStore}
                    handleUpdateSubmit={handleUpdateSubmit}
                    setShowUpdateForm={setShowUpdateForm}
                />
            )}
        </div>
    );
};

export default StatusPage;
