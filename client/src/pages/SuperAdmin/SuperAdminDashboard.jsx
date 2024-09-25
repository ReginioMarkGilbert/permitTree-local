import React from 'react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
            <nav className="space-y-4">
                <Link to="/superadmin/home" className="block p-2 bg-green-600 text-white rounded hover:bg-green-700">Home</Link>
                <Link to="/superadmin/dashboard" className="block p-2 bg-green-600 text-white rounded hover:bg-green-700">Dashboard</Link>
                <Link to="/superadmin/manage-users" className="block p-2 bg-green-600 text-white rounded hover:bg-green-700">Manage Users</Link>
                <Link to="/superadmin/reports" className="block p-2 bg-green-600 text-white rounded hover:bg-green-700">Reports</Link>
            </nav>
        </div>
    );
};

export default SuperAdminDashboard;
