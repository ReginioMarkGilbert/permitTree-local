import React from 'react';

export const Card = ({ children, className }) => {
    return (
        <div className={`flex flex-col p-6 rounded-lg shadow-lg bg-white ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children }) => {
    return <div className="mb-4">{children}</div>;
};

export const CardTitle = ({ children, className }) => {
    return <h2 className={`text-[25px] font-bold text-green-700 ${className}`}>{children}</h2>;
};

export const CardContent = ({ children }) => {
    return <div className="flex-grow mb-4">{children}</div>; // Added flex-grow to allow expansion
};

export const CardFooter = ({ children, className }) => {
    return <div className={`mt-4 flex justify-between ${className}`}>{children}</div>;
};
