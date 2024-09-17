import React from 'react';

const Input = ({ id, name, value, onChange, placeholder, type = 'text', required = false }) => {
    return (
        <input
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            required={required}
            className="border rounded p-2 w-full"
        />
    );
};

export default Input;
