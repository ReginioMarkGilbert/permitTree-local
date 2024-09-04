import { React, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import UserSidebar from '../../components/layout/UserSidebar';

import { useNavigate } from 'react-router-dom';
import '../../styles/PermitsPage.css';

const PermitsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleApplyClick = (formType) => {
        navigate(`/apply/${formType}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 ">
            <UserSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
            <div className="max-w-7xl mx-auto custom-scrollbar mb-18 overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-full pb-6" > {/* container for the permit applications */}
                <Navbar sidebarToggle={isOpen} setSidebarToggle={setIsOpen} />
                <h1 className="text-3xl font-bold text-center mb-[70px] sm:mt-12 mt-14">Permit Applications</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 "> {/* boxes/permit applications */}
                    <div className="h-[240px] bg-gray-500 p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
                        <h3 className="text-xl font-bold mb-2 text-center">Chainsaw registration</h3>
                        <p className="mt-4 text-center">Application for Chainsaw registration</p>
                        <button className="bg-custom-green text-white py-2 px-4 rounded w-[250px] hover:bg-dark-green" onClick={() => handleApplyClick('chainsaw')}>APPLY</button>
                    </div>
                    <div className="h-[240px] bg-gray-500 p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
                        <h3 className="text-xl font-bold mb-2 text-center">Certificate of Verification</h3>
                        <p className="mt-4 text-center">Application for Certificate of Verification</p>
                        <button className="bg-custom-green text-white py-2 px-4 rounded w-[250px] hover:bg-dark-green" onClick={() => handleApplyClick('cov')}>APPLY</button>
                    </div>
                    <div className="h-[240px] bg-gray-500 p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
                        <h3 className="text-xl font-bold mb-2 text-center">Private Tree Plantation Registration</h3>
                        <p className="mt-4 text-center">Application for Private Tree Plantation Registration</p>
                        <button className="bg-custom-green text-white py-2 px-4 rounded w-[250px] hover:bg-dark-green" onClick={() => handleApplyClick('ptpr')}>APPLY</button>
                    </div>
                    <div className="h-[240px] bg-gray-500 p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
                        <h3 className="text-xl font-bold mb-2 text-center">Public Land Timber Permit</h3>
                        <p className="mt-4 text-center">Application for Public Land Timber Permit</p>
                        <button className="bg-custom-green text-white py-2 px-4 rounded w-[250px] hover:bg-dark-green" onClick={() => handleApplyClick('tc_public')}>APPLY</button>
                    </div>
                    <div className="h-[240px] bg-gray-500 p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
                        <h3 className="text-xl font-semibold mb-2 text-center">Special/Private Land Timber Permit</h3>
                        <p className="mb-4 text-center">Application for Special Private Land Timber Permit</p>
                        <button className="bg-custom-green text-white py-2 px-4 rounded w-[250px] hover:bg-dark-green" onClick={() => handleApplyClick('tc_private')}>APPLY</button>
                    </div>
                    <div className="h-[240px] bg-gray-500 p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
                        <h3 className="text-xl font-semibold mb-2 text-center">National Government Agency Tree Cutting Permit</h3>
                        <p className="mb-4 text-center">Application for Public Tree cutting permit</p>
                        <button className="bg-custom-green text-white py-2 px-4 rounded w-[250px] hover:bg-dark-green" onClick={() => handleApplyClick('tc_nga')}>APPLY</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermitsPage;
