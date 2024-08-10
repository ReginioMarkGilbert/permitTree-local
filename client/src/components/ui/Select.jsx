import React from 'react';

const Select = ({ options, onChange, value }) => {
    return (
        <select onChange={onChange} value={value} className="border rounded p-2">
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default Select;
