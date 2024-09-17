import React from 'react';

const Modal = ({ isOpen, title, message, onClose, onHome, onApplications }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onHome} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                        Go to Home
                    </button>
                    <button onClick={onApplications} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Go to Applications page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
