import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';

const App = () => {
    const [sidebarToggle, setSidebarToggle] = useState(false);
    return (
        <div className="flex">
            <Sidebar isOpen={sidebarToggle} />
            <div className={`flex-1 transition-all duration-300 ${sidebarToggle ? 'ml-64' : 'ml-0'}`}>
                <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle} />
                <div className="p-4">
                    <HomePage />
                </div>
            </div>
        </div>
    );
};

export default App;
