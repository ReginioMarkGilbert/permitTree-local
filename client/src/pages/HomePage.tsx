import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import denrLogo from '../assets/denr-logo.png'; // Ensure the path to the logo is correct

function HomePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex pt-0 bg-gray-500 ">
            {isSidebarOpen && <Sidebar />}
            <div className="flex-grow p-0 pl-0">
                <Navbar toggleSidebar={toggleSidebar} />
                <div className="flex justify-center items-center h-screen bg-gray-100 text-center">
                    <div className="bg-white p-10 rounded-lg shadow-md" style={{width: '700px'}}>
                        <img src={denrLogo} alt="DENR Logo" className="w-24 mb-5 mx-auto"/>
                        <h1 className="text-3xl font-bold text-custom-green">Welcome to DENR</h1>
                        <p className="my-2.5 text-gray-900 mt-5">Department of Environment and Natural Resources</p>
                        <p className="my-2.5 text-gray-900">Committed to the protection, conservation, and management of the environment and natural resources for the present and future generations.</p>
                        <button className="h-[2.75rem] bg-custom-green text-white border-none px-5 py-2.5 rounded cursor-pointer text-base mt-5 hover:bg-dark-green justify-center items-center">Get Started</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HomePage;
