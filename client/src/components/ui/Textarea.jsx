import React from 'react';

export const Textarea = ({ id, name, placeholder, rows, required, value, onChange, className }) => {
    return (
        <textarea
            id={id}
            name={name}
            placeholder={placeholder}
            rows={rows}
            required={required}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent ${className}`}
        />
    );
};

export default Textarea;
