//  ISSUANCE OF PRIVATE LAND TIMBER PERMIT (PLTP) FOR NON-PREMIUIM SPECIES, OR SPECIAL PLTP (SPLTP) FOR PREMIUM/ NATURALLY-GROWN TREES WITHIN PRIVATE/ TITLED LANDS

import React, { useState } from 'react';

const TC_PrivateForm = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [landTitle, setLandTitle] = useState('');
    const [treeCount, setTreeCount] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { name, address, phone, landTitle, treeCount };
        console.log('Form Data:', formData);
    };

    return (
        <div className="form-container">
            <h3>Apply for Private Land Timber Permit</h3>
            <form id="tcPrivateForm" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4 className='form-title'>Applicant Details</h4>
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
                <div className="form-section">
                    <h4 className='form-title'>Land Details</h4>
                    <label htmlFor="landTitle">Land Title</label>
                    <input
                        type="text"
                        id="landTitle"
                        name="landTitle"
                        placeholder="Enter Land Title"
                        value={landTitle}
                        onChange={(e) => setLandTitle(e.target.value)}
                        required
                    />
                    <label htmlFor="treeCount">Number of Trees</label>
                    <input
                        type="number"
                        id="treeCount"
                        name="treeCount"
                        placeholder="Enter Number of Trees"
                        value={treeCount}
                        onChange={(e) => setTreeCount(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default TC_PrivateForm;