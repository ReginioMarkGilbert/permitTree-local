import React from 'react';

export const RadioGroup = ({ children, onValueChange, value }) => {
    return (
        <div onChange={(e) => onValueChange(e.target.value)}>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { checked: child.props.value === value })
            )}
        </div>
    );
};

export const RadioGroupItem = ({ value, id, checked }) => {
    return (
        <input type="radio" id={id} name="radio-group" value={value} checked={checked} />
    );
};
