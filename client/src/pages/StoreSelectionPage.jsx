import React, { useState } from 'react';
import './styles/StoreSelectionPage.css';

const StoreSelectionPage = ({ onContinue }) => {
    const [store, setStore] = useState('');

    const handleSelect = (event) => {
        setStore(event.target.value);
    };

    const handleSubmit = () => {
        if (store) {
            onContinue(store); // Use the passed function to continue to the form
        } else {
            alert('Please select a store');
        }
    };

    return (
        <div className="store-selection-container">
            <h3 className="store-selection-title">Select a Store</h3>
            <select className="store-selection-select" value={store} onChange={handleSelect}>
                <option value="">Select...</option>
                <option value="store1">Store 1</option>
                <option value="store2">Store 2</option>
                <option value="store3">Store 3</option>
            </select>
            <button className="store-selection-button" onClick={handleSubmit}>Continue</button>
        </div>
    );
};

export default StoreSelectionPage;