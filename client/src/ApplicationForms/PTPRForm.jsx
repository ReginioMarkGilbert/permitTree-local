// PRIVATE TREE PLANTATION REGISTRATION (PTPR)
// This Certificate shows the ownership of plantations or planted trees within private, titled lands or tax declared alienable and disposable lands. The issuance of PTPR requires inventory and ocular inspection in the area. Tree inventory for permits (e.g. TCP or PLTP) is a process conducted separately from the inspection for PTPR per existing DENR policies, rules and regulations.

import React, { useState } from 'react';

const PTPRForm = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [landArea, setLandArea] = useState('');
    const [treeSpecies, setTreeSpecies] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { name, address, phone, landArea, treeSpecies };
        console.log('Form Data:', formData);
    };

    return (
        <div className="form-container">
            <h3>Apply for Private Tree Plantation Registration</h3>
            <form id="ptprForm" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4 className='form-title'>Applicant Details</h4>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <label htmlFor="address">Address</label>
                    <input type="text" id="address" name="address" placeholder="Barangay, Bayan, Probinsya" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="e.g. 09123456789" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-section">
                    <h4 className='form-title'>Land Details</h4>
                    <label htmlFor="landArea">Land Area (in hectares)</label>
                    <input type="number" id="landArea" name="landArea" placeholder="Enter Land Area" value={landArea} onChange={(e) => setLandArea(e.target.value)} required />
                    <label htmlFor="treeSpecies">Tree Species</label>
                    <input type="text" id="treeSpecies" name="treeSpecies" placeholder="Enter Tree Species" value={treeSpecies} onChange={(e) => setTreeSpecies(e.target.value)} required />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default PTPRForm;