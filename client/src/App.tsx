import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PermitsPage from './pages/permitsPage';

const App = () => {
    const [sidebarToggle, setSidebarToggle] = useState(false);
    return (
        <Router>
            <div className="flex">
                <Sidebar isOpen={sidebarToggle} />
                <div className={`flex-1 transition-all duration-300 ${sidebarToggle ? 'ml-64' : 'ml-0'}`}>
                    <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle} />
                    <div className="p-4">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/permits" element={<PermitsPage />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default App;
