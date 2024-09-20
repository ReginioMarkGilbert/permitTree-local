import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Printer, Archive, ChevronUp, ChevronDown, Leaf } from 'lucide-react';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import EditApplicationModal from '../../components/ui/EditApplicationModal';
import { toast } from 'react-toastify';
import './styles/UserApplicationStatusPage.css';

const UserApplicationsStatusPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Submitted');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [sortConfig, setSortConfig] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditApplication, setSelectedEditApplication] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [activeTab, filterType]); // Add filterType to the dependency array

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/csaw_getApplications', {
                params: {
                    status: activeTab,
                    applicationType: filterType // Add this line
                },
                headers: {
                    Authorization: token
                }
            });
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch applications');
            setLoading(false);
            toast.error('Failed to fetch applications');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
        }
        return null;
    };

    const handleAction = (action, application) => {
        console.log(`Action: ${action}`, application);
    };

    const handleView = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/csaw_getApplicationById/${id}`, {
                headers: { Authorization: token }
            });
            setSelectedApplication(response.data);
            setIsViewModalOpen(true);
        } catch (error) {
            console.error('Error fetching application details:', error);
            toast.error('Failed to fetch application details');
        }
    };

    const handleEdit = (application) => {
        setSelectedEditApplication(application);
        setIsEditModalOpen(true);
    };

    const handleUpdateApplication = (updatedApplication) => {
        setApplications(applications.map(app =>
            app._id === updatedApplication._id ? updatedApplication : app
        ));
    };

    const handleSubmitDraft = async (application) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3000/api/csaw_submitDraft/${application._id}`, {}, {
                headers: { Authorization: token }
            });
            if (response.data.success) {
                toast.success('Application submitted successfully');
                fetchApplications(); // Refresh the applications list
            } else {
                toast.error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting draft application:', error);
            toast.error('Failed to submit application');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('customId')}>
                                APPLICATION NUMBER {renderSortIcon('customId')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                APPLICATION TYPE
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden sm:table-cell" onClick={() => handleSort('dateOfSubmission')}>
                                DATE  {renderSortIcon('dateOfSubmission')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app) => (
                            <tr key={app._id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {app.customId}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                    {app.applicationType}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                    {new Date(app.dateOfSubmission).toLocaleDateString()}
                                </td>
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
                                        <button className="text-blue-600 hover:text-blue-900 action-icon" onClick={() => handleEdit(app)}>
                                            <Edit className="inline w-4 h-4" />
                                        </button>
                                        <button className="text-purple-600 hover:text-purple-900 action-icon" onClick={() => handleAction('print', app)}>
                                            <Printer className="inline w-4 h-4" />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 action-icon" onClick={() => handleAction('archive', app)}>
                                            <Archive className="inline w-4 h-4" />
                                        </button>
                                        {app.status === 'Draft' && (
                                            <button className="text-yellow-600 hover:text-yellow-900" onClick={() => handleSubmitDraft(app)}>
                                                <Leaf className="inline w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // fetchApplications will be called automatically due to the useEffect dependency
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
                <h1 className="text-3xl font-bold mb-6 text-green-800">My Applications</h1>
                <div className="mb-6 overflow-x-auto">
                    <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                        {['Draft', 'Submitted', 'Returned', 'Accepted', 'Released', 'Expired', 'Rejected'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-md p-2 w-full sm:w-auto"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border rounded-md p-2 w-full sm:w-auto"
                    >
                        <option value="">All Types</option>
                        {['Chainsaw Registration', 'Certificate of Verification', 'Private Tree Plantation Registration (PTPR)', 'Government Project Timber Permit', 'Private Land Timber Permit', 'Public Land Timber Permit'].map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="border rounded-md p-2 w-full sm:w-auto"
                    />
                </div>
                {renderTable()}
            </div>

            <ApplicationDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                application={selectedApplication}
            />

            <EditApplicationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                application={selectedEditApplication}
                onUpdate={handleUpdateApplication}
            />
        </div>
    );
};

export default UserApplicationsStatusPage;
