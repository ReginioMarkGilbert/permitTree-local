import React from 'react';

const Label = ({ children, className, ...props }) => {
  return (
    <label className={`block text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
};

export default Label;
