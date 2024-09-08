// CERTIFICATE OF VERIFICATION (COV) FOR THE TRANSPORT OF PLANTED TREES WITHIN PRIVATE LAND, NON-TIMBER FOREST PRODUCTS EXCEPT RATTAN AND BAMBOO
// COV is a document to be presented when transporting planted trees within private lands not registered under the Private Tree Plantation Registration and/or non-premium trees, non-timber forest products (except rattan and bamboo)

import React, { useState } from 'react';

const COVForm = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [treeType, setTreeType] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { name, address, phone, treeType, quantity };
        console.log('Form Data:', formData);
    };

    return (
        <div className="form-container">
            <h3>Apply for Certificate of Verification</h3>
            <form id="covForm" onSubmit={handleSubmit}>
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
                    <h4 className='form-title'>Tree Details</h4>
                    <label htmlFor="treeType">Tree Type</label>
                    <input
                        type="text"
                        id="treeType"
                        name="treeType"
                        placeholder="Enter Tree Type"
                        value={treeType}
                        onChange={(e) => setTreeType(e.target.value)}
                        required
                    />
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        placeholder="Enter Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default COVForm;
