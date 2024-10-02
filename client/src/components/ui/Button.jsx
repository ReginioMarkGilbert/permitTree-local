import React from 'react';

const Button = ({ children, variant, className, ...props }) => {
    const baseStyle = 'py-2 px-4 rounded';
    const variantStyle = variant === 'outline' ? 'border' : 'bg-green-600 text-white';
    const hoverStyle = variant === 'outline' ? 'hover:bg-green-100' : 'hover:bg-green-700';

    return (
        <button className={`${baseStyle} ${variantStyle} ${hoverStyle} ${className}`} {...props}>
            {children}
        </button>
    );
};

export { Button };
