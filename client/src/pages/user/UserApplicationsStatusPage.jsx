import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaEdit, FaEye, FaPrint, FaArchive } from 'react-icons/fa';

const UserApplicationsStatusPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('submitted');

    useEffect(() => {
        fetchApplications();
    }, [activeTab]);

    const fetchApplications = async () => {
        try {
            const params = { status: activeTab };
            const response = await axios.get('http://localhost:3000/api/csaw_getApplications', { params });

            if (Array.isArray(response.data)) {
                setApplications(response.data);
            } else {
                console.error('Response data is not an array:', response.data);
                setApplications([]);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to fetch applications.');
            setLoading(false);
        }
    };

    const handleAction = (action, application) => {
        // Implement your action handlers here (e.g., view, edit, print)
        console.log(`Action: ${action}`, application);
    };

    const renderStatusIcon = (status) => {
        switch (status) {
            case 'Accepted':
                return <FaCheck className="text-green-500" />;
            case 'Rejected':
                return <FaTimes className="text-red-500" />;
            default:
                return null;
        }
    };

    const renderTable = () => {
        if (loading) {
            return <p className="text-center text-gray-500">Loading applications...</p>;
        }

        if (error) {
            return <p className="text-center text-red-500">{error}</p>;
        }

        if (applications.length === 0) {
            return <p className="text-center text-gray-500">No applications found.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Application Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Application Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Submitted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app) => (
                            <tr key={app._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {app.customId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {app.applicationType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(app.dateOfSubmission).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        {renderStatusIcon(app.status)}
                                        <span className="ml-2">{app.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAction('view', app)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                                        >
                                            <FaEye className="inline mr-1" /> View
                                        </button>
                                        <button
                                            onClick={() => handleAction('edit', app)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                        >
                                            <FaEdit className="inline mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleAction('print', app)}
                                            className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
                                        >
                                            <FaPrint className="inline mr-1" /> Print
                                        </button>
                                        <button
                                            onClick={() => handleAction('archive', app)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                                        >
                                            <FaArchive className="inline mr-1" /> Archive
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-green-800">My Applications</h1>
            <div className="mb-4">
                <div className="inline-flex rounded-md bg-green-100 p-1">
                    {['submitted', 'accepted', 'rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${activeTab === tab
                                    ? 'bg-white text-green-800 shadow-sm'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-green-200'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                    {renderTable()}
                </div>
            </div>
        </div>
    );
};

export default UserApplicationsStatusPage;
