// ISSUANCE OF TREE CUTTING PERMIT FOR PLANTED TREES AND NATURALLY GROWING TREES FOUND WITHIN PUBLIC PLACES (PLAZA, PUBLIC PARKS, SCHOOL PREMISES OR POLITICAL SUBDIVISIONS) FOR PURPOSES OF PUBLIC SAFETY
// This Permit serves as proof of authorization for the removal/cutting of trees in public places (Plaza, Public Parks, School Premises or Political Subdivisions for purposes of public safety).

import React, { useState } from 'react';

const TC_PublicForm = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { name, address, phone, location, reason };
        console.log('Form Data:', formData);
    };

    return (
        <div className="form-container">
            <h3>Apply for Tree Cutting Permit (Public)</h3>
            <form id="tcPublicForm" onSubmit={handleSubmit}>
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
                    <h4 className='form-title'>Permit Details</h4>
                    <label htmlFor="location">Location</label>
                    <input type="text" id="location" name="location" placeholder="Enter Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                    <label htmlFor="reason">Reason for Cutting</label>
                    <textarea id="reason" name="reason" placeholder="Enter Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default TC_PublicForm;