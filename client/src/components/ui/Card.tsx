import React from 'react';

interface CardProps {
    title: string;
    description: string;
    buttonText: string;
}

const Card: React.FC<CardProps> = ({ title, description, buttonText }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-gray-700">{description}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {buttonText}
            </button>
        </div>
    );
};

export default Card;
