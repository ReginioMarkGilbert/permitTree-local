import React from 'react';

const AuthButton = ({ children, className, ...props }) => {
    return (
        <button className={`py-2 px-4 rounded ${className}`} {...props}>
            {children}
        </button>
    );
};

export default AuthButton;
