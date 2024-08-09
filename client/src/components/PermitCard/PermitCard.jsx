import React from 'react';
import './PermitCard.css';

const PermitCard = ({ title, description, onApplyClick, buttonStyle }) => {
    return (
        <div className="h-[230px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-center px-3">{title}</h3>
            <p className="mt-4 text-center px-4">{description}</p>
            <button
                className="permit-button mt-7 py-2 px-4 rounded w-[250px] hover:bg-gray-800"
                style={buttonStyle}
                onClick={onApplyClick}
            >
                APPLY
            </button>
        </div>
    );
};

export default PermitCard;
