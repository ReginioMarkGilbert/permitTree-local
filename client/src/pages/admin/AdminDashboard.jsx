import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, Leaf, Printer } from 'lucide-react';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import EditApplicationModal from '../../components/ui/EditApplicationModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { toast } from 'react-toastify';
import AdminApplicationDetailsModal from './components/AdminApplicationDetailsModal';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditApplication, setSelectedEditApplication] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, type: null, application: null });
    const [activeTab, setActiveTab] = useState('For Review'); // Default tab

    useEffect(() => {
        fetchApplications();
    }, [activeTab]); // Fetch applications when the active tab changes

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/all-applications', {
                headers: { Authorization: token }
            });

            // Map the applications to change "Submitted" to "For Review"
            const updatedApplications = response.data.map(app => ({
                ...app,
                status: app.status === 'Submitted' ? 'For Review' : app.status // Change status for admin view
            }));
            // toast.success('Applications fetched successfully');
            setApplications(updatedApplications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch applications');
            setLoading(false);
            toast.error('Failed to fetch applications');
        }
    };

    const handleView = async (id) => {
        try {
            setLoading(true); // Set loading to true before making the API call
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/getApplicationById/${id}`, {
                headers: { Authorization: token }
            });
            setSelectedApplication(response.data);
            setIsViewModalOpen(true);
            setLoading(false); // Set loading to false after the API call is complete
        } catch (error) {
            console.error('Error fetching application details:', error);
            toast.error('Failed to fetch application details');
            setLoading(false); // Set loading to false in case of error
        }
    };

    const handleEdit = (application) => {
        setSelectedEditApplication(application);
        setIsEditModalOpen(true);
    };

    const handleDelete = (application) => {
        setConfirmationModal({
            isOpen: true,
            type: 'delete',
            application,
            title: 'Delete Application',
            message: "Are you sure you want to delete this application? This action cannot be undone."
        });
    };

    const handleConfirmAction = async () => {
        const { type, application } = confirmationModal;
        setConfirmationModal({ isOpen: false, type: null, application: null });

        try {
            const token = localStorage.getItem('token');
            if (type === 'delete') {
                await axios.delete(`http://localhost:3000/api/csaw_deleteApplication/${application._id}`, {
                    headers: { Authorization: token }
                });
                toast.success('Application deleted successfully');
                fetchApplications();
            }
        } catch (error) {
            console.error(`Error deleting application:`, error);
            toast.error('Failed to delete application');
        }
    };

    const handlePrint = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/print/${id}`, {
                headers: { Authorization: token },
                responseType: 'blob', // Important for receiving binary data
            });

            // Create a blob from the PDF data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open the PDF in a new window
            window.open(url);
        } catch (error) {
            console.error('Error printing application:', error);
            toast.error('Failed to print application');
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

        // Filter applications based on the active tab
        const filteredApplications = applications.filter(app => app.status === activeTab);

        return (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION NUMBER</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION TYPE</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.map((app) => (
                            <tr key={app._id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.customId}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicationType}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.dateOfSubmission).toLocaleDateString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-wrap gap-2">
                                        <button className="text-green-600 hover:text-green-900 action-icon" onClick={() => handleView(app._id)}>
                                            <Eye className="inline w-4 h-4" />
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900 action-icon" onClick={() => handlePrint(app._id)}>
                                            <Printer className="inline w-4 h-4" />
                                        </button>
                                        <Link
                                            to={`/admin/review/${app._id}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Review
                                        </Link>
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
        <div className="min-h-screen bg-green-50">
            <nav className="bg-white shadow-md z-10 flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <Leaf className="h-8 w-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-800">PermitTree</span>
                </div>
            </nav>

            <div className="container mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-3xl font-bold mb-6 text-green-800">All Applications</h1>

                {/* Tab Buttons */}
                <div className="mb-6 overflow-x-auto">
                    <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                        {['For Review', 'In Progress', 'Returned', 'Accepted', 'Released', 'Rejected'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                {renderTable()}
            </div>

            <AdminApplicationDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                application={selectedApplication}
            />

            <EditApplicationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                application={selectedEditApplication}
            />

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({ isOpen: false, type: null, application: null })}
                onConfirm={handleConfirmAction}
                title={confirmationModal.title}
                message={confirmationModal.message}
            />
        </div>
    );
};

export default AdminDashboard;
