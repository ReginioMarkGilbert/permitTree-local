// Government Project Timber Permit
// ISSUANCE OF TREE CUTTING AND/OR EARTH BALLING PERMIT FOR TREES AFFECTED BY PROJECTS OF NATIONAL GOVERNMENT AGENCIES (DPWH, DOTR, DepEd, DA, DOH, CHED, DOE, and NIA)
// This Permit serves as proof of authorization for the removal/cutting and/or relocation of trees affected by projects of the National Government Agencies (DPWH, DOTR, DepEd, DA, DOH, CHED, DOE and NIA)

import React, { useState } from 'react';

const TC_NGAForm = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectLocation, setProjectLocation] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { name, address, phone, projectName, projectLocation };
        console.log('Form Data:', formData);
    };

    return (
        <div className="form-container">
            <h3>Apply for Tree Cutting and/or Earth Balling Permit (NGA)</h3>
            <form id="tcNGAForm" onSubmit={handleSubmit}>
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
                    <h4 className='form-title'>Project Details</h4>
                    <label htmlFor="projectName">Project Name</label>
                    <input
                        type="text"
                        id="projectName"
                        name="projectName"
                        placeholder="Enter Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                    <label htmlFor="projectLocation">Project Location</label>
                    <input
                        type="text"
                        id="projectLocation"
                        name="projectLocation"
                        placeholder="Enter Project Location"
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default TC_NGAForm;
