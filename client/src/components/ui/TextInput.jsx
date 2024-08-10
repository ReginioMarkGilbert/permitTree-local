import React from 'react';

const TextInput = ({ label, value, onChange }) => {
    return (
        <div className="input-container">
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="w-full p-2 mb-4 border rounded"
            />
            <label className="input-label">{label}</label>
        </div>
    );
};

export default TextInput;
