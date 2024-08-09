const PermitsPage = () => {
    const handleApplyClick = () => {
        // Handle apply click
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-[70px]">Permit Applications</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Chainsaw registration</h3>
                        <p className="mt-4 text-center">Application for Chainsaw registration</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={handleApplyClick}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Certificate of Verification</h3>
                        <p className="mt-4 text-center">Application for Certificate of Verification</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={handleApplyClick}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Private Tree Plantation Registration</h3>
                        <p className="mt-4 text-center">Application for Private Tree Plantation Registration</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={handleApplyClick}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-center">Private Land Timber Permit</h3>
                        <p className="mt-4 text-center">Application for Private Land Timber Permit</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={handleApplyClick}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2 text-center">Special Private Land Timber Permit</h3>
                        <p className="mb-4 text-center">Application for Special Private Land Timber Permit</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={handleApplyClick}>APPLY</button>
                    </div>
                    <div className="h-[200px] bg-gray-200 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2 text-center">Tree cutting permit</h3>
                        <p className="mb-4 text-center">Application for Public Tree cutting permit</p>
                        <button className="mt-7 bg-black text-white py-2 px-4 rounded w-[250px] hover:bg-gray-800" onClick={handleApplyClick}>APPLY</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermitsPage;
