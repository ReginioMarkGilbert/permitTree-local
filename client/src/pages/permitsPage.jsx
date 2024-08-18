import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/PermitsPage.css'; // Import the CSS file for custom scrollbar styles

const PermitsPage = () => {
    const navigate = useNavigate();

    const handleApplyClick = (formType) => {
        navigate(`/apply/${formType}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto custom-scrollbar mb-18" style={{ maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
                <h1 className="text-3xl font-bold text-center mb-[70px]">Permit Applications</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Chainsaw registration</h3>
                        <p className="mt-4 text-center">Application for Chainsaw registration</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={() => handleApplyClick('chainsaw')}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Certificate of Verification</h3>
                        <p className="mt-4 text-center">Application for Certificate of Verification</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={() => handleApplyClick('cov')}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Private Tree Plantation Registration</h3>
                        <p className="mt-4 text-center">Application for Private Tree Plantation Registration</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={() => handleApplyClick('ptpr')}>APPLY</button>
                    </div>
                    <div className="h-[220px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Public Land Timber Permit</h3>
                        <p className="mt-4 text-center">Application for Public Land Timber Permit</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={() => handleApplyClick('tc_public')}>APPLY</button>
                    </div>
                    <div className="h-[220px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2 text-center">Special/Private Land Timber Permit</h3>
                        <p className="mb-4 text-center">Application for Special Private Land Timber Permit</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={() => handleApplyClick('tc_private')}>APPLY</button>
                    </div>
                    <div className="h-[220px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2 text-center">National Government Agency Tree Cutting Permit</h3>
                        <p className="mb-4 text-center">Application for Public Tree cutting permit</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={() => handleApplyClick('tc_nga')}>APPLY</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermitsPage;