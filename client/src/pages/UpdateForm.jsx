import React from 'react';
import './styles/UpdateForm.css';
import uploadIcon from '../assets/upload_icn.svg';
import closeIcon from '../assets/close_icn.svg';

const UpdateForm = ({
    newName, setNewName,
    newAddress, setNewAddress,
    newPhone, setNewPhone,
    newBrand, setNewBrand,
    newModel, setNewModel,
    newSerialNumber, setNewSerialNumber,
    newDateOfAcquisition, setNewDateOfAcquisition,
    newPowerOutput, setNewPowerOutput,
    newFileNames, setNewFileNames,
    newStore, setNewStore,
    handleUpdateSubmit,
    setShowUpdateForm
}) => {

    const handleFileChange = (event) => {
        const newFiles = event.target.files;
        const newFileNamesArray = Array.from(newFiles).map(file => file.name);

        // Check for duplicate file names
        const duplicateFiles = newFileNamesArray.filter(fileName => newFileNames.includes(fileName));
        if (duplicateFiles.length > 0) {
            alert(`The following files are duplicates and will not be uploaded: ${duplicateFiles.join(', ')}`);
            return;
        }

        if (newFileNames.length + newFileNamesArray.length > 5) {
            alert("You can only upload a maximum of 5 files.");
            return;
        }

        setNewFileNames(prevFileNames => [...prevFileNames, ...newFileNamesArray]);
    };

    const handleRemoveFile = (fileNameToRemove) => {
        setNewFileNames(prevFileNames => prevFileNames.filter(fileName => fileName !== fileNameToRemove));
    };

    return (
        <div className="update-form-popup">
            <form onSubmit={handleUpdateSubmit} className="update-form">
                <div className="form-section-update_form">
                    <h4 id='applicant-details-text' className='form-title'>Applicant Details</h4>
                    <label htmlFor="newName">Name</label>
                    <input
                        type="text"
                        id="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        // required
                    />
                    <label htmlFor="newAddress">Address</label>
                    <input
                        type="text"
                        id="newAddress"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        // required
                    />
                    <label htmlFor="newPhone">Phone Number</label>
                    <input
                        type="tel"
                        id="newPhone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        // required
                    />
                </div>
                <div className="form-section">
                    <h4 className='form-title'>Chainsaw Details</h4>
                    <label htmlFor="newBrand">Brand</label>
                    <input
                        type="text"
                        id="newBrand"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        // required
                    />
                    <label htmlFor="newModel">Model</label>
                    <input
                        type="text"
                        id="newModel"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        // required
                    />
                    <label htmlFor="newSerialNumber">Serial No.</label>
                    <input
                        type="text"
                        id="newSerialNumber"
                        value={newSerialNumber}
                        onChange={(e) => setNewSerialNumber(e.target.value)}
                        // required
                    />
                    <label htmlFor="newDateOfAcquisition">Date of Acquisition</label>
                    <input
                        type="date"
                        id="newDateOfAcquisition"
                        value={newDateOfAcquisition ? newDateOfAcquisition.split('T')[0] : ''}
                        onChange={(e) => setNewDateOfAcquisition(e.target.value)}
                        // required
                    />
                    <label htmlFor="newPowerOutput">Power Output (kW/bhp)</label>
                    <input
                        type="text"
                        id="newPowerOutput"
                        value={newPowerOutput}
                        onChange={(e) => setNewPowerOutput(e.target.value)}
                        // required
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit">Update</button>
                    <button type="cancel" onClick={() => setShowUpdateForm(false)}>Cancel</button>
                </div>

                <div className="store-selection__container">
                    <h3 className="store-selection__title">Select a Store</h3>
                    <select className="store-selection__select" value={newStore} onChange={(e) => setNewStore(e.target.value)}>
                        <option value="">Select...</option>
                        <option value="store1">Store 1</option>
                        <option value="store2">Store 2</option>
                        <option value="store3">Store 3</option>
                    </select>
                </div>

                <div className="update_form_file-upload-container">
                    <label className='update_form_label-file'>change uploaded image/s of requirements</label>
                    <input
                        type="file"
                        id="fileUpload"
                        name="fileUpload"
                        accept="image/*,.pdf,.docx"
                        multiple
                        onChange={handleFileChange}
                        // required
                    />
                    <button className="update_form_file-upload-label" style={{color: 'black'}} onClick={(e) => { e.preventDefault(); document.getElementById('fileUpload').click(); }}>
                        <img src={uploadIcon} alt="Upload Icon"/>
                        Add file
                    </button>
                </div>
                <div id="fileNames" className="file-names">
                    {newFileNames.map((fileName, index) => (
                        <div key={index} className="file-name">
                            {fileName}
                            <button type="button" className="remove-file-button" onClick={() => handleRemoveFile(fileName)}>
                                <img className='remove-file-icon' src={closeIcon} alt="Close Icon" />
                            </button>
                        </div>
                    ))}
                </div>

            </form>
        </div>
    );
};

export default UpdateForm;
