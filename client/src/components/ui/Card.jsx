import React from 'react';

export const Card = ({ children, className }) => {
    return <div className={`p-6 rounded-lg shadow-lg bg-white ${className}`}>{children}</div>; // Changed shadow-md to shadow-lg
};

export const CardHeader = ({ children }) => {
    return <div className="mb-4">{children}</div>;
};

export const CardTitle = ({ children, className }) => {
    return <h2 className={`text-[25px] font-bold text-green-700 ${className}`}>{children}</h2>; // Increased font size
};

export const CardContent = ({ children }) => {
    return <div className="mb-4">{children}</div>;
};

export const CardFooter = ({ children, className }) => {
    return <div className={`mt-4 flex justify-between ${className}`}>{children}</div>;
};
