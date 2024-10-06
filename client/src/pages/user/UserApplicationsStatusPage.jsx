import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Printer, Archive, ChevronUp, ChevronDown, Leaf, Undo, Trash2, RefreshCw, FileText, Send, CreditCard } from 'lucide-react';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import EditApplicationModal from '../../components/ui/EditApplicationModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import UserOOPviewModal from './components/UserOOPviewModal';
import PaymentSimulationModal from './components/PaymentSimulationModal';
import { toast } from 'react-toastify';
import './styles/UserApplicationStatusPage.css';
import { Button } from '@/components/ui/button';

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
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, type: null, application: null });
    const [notifications, setNotifications] = useState([]);
    const [selectedOOP, setSelectedOOP] = useState(null);
    const [isOOPModalOpen, setIsOOPModalOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentApplication, setSelectedPaymentApplication] = useState(null);

    useEffect(() => {
        fetchApplications();
        fetchNotifications();
    }, [activeTab]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/getAllApplications', {
                params: { status: activeTab },
                headers: { Authorization: token }
            });
            console.log('Fetched applications:', response.data);
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch applications');
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/user/notifications', {
                headers: { Authorization: token }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
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

    const handleSubmitDraft = (application) => {
        setConfirmationModal({
            isOpen: true,
            type: 'submit',
            application,
            title: 'Submit Application',
            message: "Are you sure you want to submit this draft application? Once submitted, you won't be able to edit it further."
        });
    };

    const handleUnsubmit = (application) => {
        setConfirmationModal({
            isOpen: true,
            type: 'unsubmit',
            application,
            title: 'Unsubmit Application',
            message: "Are you sure you want to unsubmit this application? It will be moved back to drafts."
        });
    };

    const handleDelete = (application) => {
        setConfirmationModal({
            isOpen: true,
            type: 'delete',
            application,
            title: 'Delete Application',
            message: "Are you sure you want to delete this draft application? This action cannot be undone."
        });
    };

    const handleConfirmAction = async () => {
        const { type, application } = confirmationModal;
        setConfirmationModal({ isOpen: false, type: null, application: null });

        try {
            const token = localStorage.getItem('token');
            let response;

            if (type === 'submit') {
                response = await axios.put(`http://localhost:3000/api/csaw_submitDraft/${application._id}`, {}, {
                    headers: { Authorization: token }
                });
            } else if (type === 'resubmit') {
                response = await axios.put(`http://localhost:3000/api/csaw_submitReturnedApplication/${application._id}`, {}, {
                    headers: { Authorization: token }
                });

                // Create notification for Chief RPS if resubmitting
                if (response.data.success) {
                    const userResponse = await axios.get('http://localhost:3000/api/user-details', {
                        headers: { Authorization: token }
                    });
                    const user = userResponse.data.user;

                    await axios.post('http://localhost:3000/api/admin/notifications', {
                        message: `${user.firstName} ${user.lastName} has resubmitted their returned application (ID: ${application.customId}).`,
                        applicationId: application._id,
                        userId: application.userId,
                        type: 'application_resubmitted'
                    }, {
                        headers: { Authorization: token }
                    });
                }
            } else if (type === 'unsubmit') {
                response = await axios.put(`http://localhost:3000/api/csaw_unsubmitApplication/${application._id}`, {}, {
                    headers: { Authorization: token }
                });
            } else if (type === 'delete') {
                response = await axios.delete(`http://localhost:3000/api/csaw_deleteApplication/${application._id}`, {
                    headers: { Authorization: token }
                });
            }

            if (response && response.data.success) {
                toast.success(`Application ${type === 'delete' ? 'deleted' : type === 'submit' ? 'submitted' : type === 'resubmit' ? 'resubmitted' : 'unsubmitted'} successfully`);
                fetchApplications();
            } else {
                toast.error(`Failed to ${type} application`);
            }
        } catch (error) {
            console.error(`Error ${type}ing application:`, error);
            toast.error(`Failed to ${type} application`);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleViewOOP = (applicationId) => {
        setSelectedApplicationId(applicationId);
        setIsOOPModalOpen(true);
    };

    const handleSimulatePayment = (application) => {
        setSelectedPaymentApplication(application);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentComplete = async (applicationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/user/oop/${applicationId}/simulate-payment`, {}, {
                headers: { Authorization: token }
            });
            toast.success('Payment simulation completed');
            fetchApplications(); // Refresh the applications list
            setIsPaymentModalOpen(false);
        } catch (error) {
            console.error('Error simulating payment:', error);
            toast.error('Failed to simulate payment');
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
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-wrap gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                                            onClick={() => handleView(app._id)}
                                            title="View"
                                        >
                                            <Eye className="h-3 w-3" />
                                        </Button>

                                        {app.status === 'Awaiting Payment' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                                                    onClick={() => handleViewOOP(app.customId)}
                                                    title="View OOP"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleSimulatePayment(app)}
                                                    title="Simulate Payment"
                                                >
                                                    <CreditCard className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}

                                        {(app.status === 'Draft' || app.status === 'Returned') && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                                onClick={() => handleEdit(app)}
                                                title="Edit"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        )}

                                        {app.status === 'Draft' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                                                    onClick={() => handleSubmitDraft(app)}
                                                    title="Submit"
                                                >
                                                    <Send className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleDelete(app)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}

                                        {app.status === 'Returned' && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                                                onClick={() => handleSubmitReturned(app)}
                                                title="Resubmit"
                                            >
                                                <Send className="h-3 w-3" />
                                            </Button>
                                        )}

                                        {app.status === 'Submitted' && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6 text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50"
                                                onClick={() => handleUnsubmit(app)}
                                                title="Unsubmit"
                                            >
                                                <Undo className="h-3 w-3" />
                                            </Button>
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Submitted': return 'bg-blue-100 text-blue-800';
            case 'Returned': return 'bg-yellow-100 text-yellow-800';
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Awaiting Payment': return 'bg-purple-100 text-purple-800';
            case 'Released': return 'bg-indigo-100 text-indigo-800';
            case 'Expired': return 'bg-red-100 text-red-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // fetchApplications will be called automatically due to the useEffect dependency
    };

    const handleSubmitReturned = (application) => {
        setConfirmationModal({
            isOpen: true,
            type: 'resubmit',
            application,
            title: 'Resubmit Application',
            message: "Are you sure you want to resubmit this returned application? Make sure you've addressed all the issues mentioned in the return remarks."
        });
    };

    const handleRefresh = () => {
        fetchApplications();
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-green-800">My Applications</h1>
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
                <div className="mb-6 overflow-x-auto">
                    <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                        {['Draft', 'Submitted', 'Returned', 'Accepted', 'Awaiting Payment', 'Released', 'Expired', 'Rejected'].map((tab) => (
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

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({ isOpen: false, type: null, application: null })}
                onConfirm={handleConfirmAction}
                title={confirmationModal.title}
                message={confirmationModal.message}
            />

            <UserOOPviewModal
                isOpen={isOOPModalOpen}
                onClose={() => setIsOOPModalOpen(false)}
                applicationId={selectedApplicationId}
            />

            <PaymentSimulationModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentComplete={handlePaymentComplete}
                totalAmount={selectedPaymentApplication?.totalAmount || 0}
                applicationId={selectedPaymentApplication?.customId}
            />
        </div>
    );
};

export default UserApplicationsStatusPage;
