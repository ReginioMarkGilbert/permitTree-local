import React from 'react';

const Textarea = ({ id, placeholder, rows, required }) => {
    return (
        <textarea
            id={id}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
    );
};

export default Textarea;
