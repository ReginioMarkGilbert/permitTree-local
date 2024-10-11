import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Eye, Printer, FileText, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import ChiefRPSApplicationReviewModal from './components/ChiefRPSApplicationReviewModal';
import ChiefRPSApplicationViewModal from './components/ChiefRPSApplicationViewModal';
import OrderOfPaymentModal from './components/OrderOfPaymentModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { Button } from "@/components/ui/button";

// Separate component for table row
const ApplicationRow = React.memo(({ app, onView, onPrint, onReview, onOrderOfPayment, onUndoStatus, getStatusColor }) => (
    <tr key={app._id}>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.customId}</td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicationType}</td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.dateOfSubmission).toLocaleDateString()}</td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                {app.status}
            </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex flex-wrap gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                    onClick={() => onView(app._id, app.status)}
                    title="View"
                >
                    <Eye className="h-3 w-3" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                    onClick={() => onPrint(app._id)}
                    title="Print"
                >
                    <Printer className="h-3 w-3" />
                </Button>
                {app.status === 'For Review' && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => onReview(app._id)}
                        title="Review"
                    >
                        <FileText className="h-3 w-3" />
                    </Button>
                )}
                {app.status === 'Accepted' && (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => onOrderOfPayment(app)}
                            title="Create Order of Payment"
                        >
                            <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => onUndoStatus(app._id)}
                            title="Undo Status"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </>
                )}
            </div>
        </td>
    </tr>
));

const ChiefRPSDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditApplication, setSelectedEditApplication] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        type: null,
        application: null,
        title: '',
        message: ''
    });
    const [activeTab, setActiveTab] = useState('For Review');
    const [reviewConfirmation, setReviewConfirmation] = useState({ isOpen: false, applicationId: null });
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isOrderOfPaymentModalOpen, setIsOrderOfPaymentModalOpen] = useState(false);
    const [selectedOrderOfPaymentApp, setSelectedOrderOfPaymentApp] = useState(null);

    const handleStatusUpdate = useCallback((updatedApplication) => {
        setApplications(prevApplications =>
            prevApplications.map(app =>
                app._id === updatedApplication._id ? updatedApplication : app
            ).filter(app => app.status === activeTab ||
                (activeTab === 'For Review' && ['Submitted', 'For Review'].includes(app.status)))
        );
        // Don't change the active tab, just refresh the current view
        fetchApplications();
    }, [activeTab]);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let statusFilter = activeTab;
            if (activeTab === 'For Review') {
                statusFilter = ['Submitted', 'For Review'];
            }
            const response = await axios.get('http://localhost:3000/api/admin/all-applications', {
                params: {
                    status: statusFilter
                },
                headers: { Authorization: token }
            });

            const updatedApplications = response.data.map(app => ({
                ...app,
                status: app.status === 'Submitted' ? 'For Review' : app.status
            }));
            setApplications(updatedApplications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch applications');
            setLoading(false);
            toast.error('Failed to fetch applications');
        }
    }, [activeTab]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleView = useCallback(async (id, status) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/getApplicationById/${id}`, {
                headers: { Authorization: token }
            });
            setSelectedApplication(response.data);
            if (status === 'In Progress') {
                setIsReviewModalOpen(true);
            } else {
                setIsViewModalOpen(true);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching application details:', error);
            toast.error('Failed to fetch application details');
            setLoading(false);
        }
    }, []);

    const handlePrint = useCallback(async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/print/${id}`, {
                headers: { Authorization: token },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        } catch (error) {
            console.error('Error printing application:', error);
            toast.error('Failed to print application');
        }
    }, []);

    const handleReview = useCallback(async (applicationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axios.post(`http://localhost:3000/api/admin/review-application/${applicationId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Application marked as In Progress');
                fetchApplications();
            } else {
                toast.error(response.data.message || 'Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error(error.response?.data?.message || 'Failed to update application status');
        }
    }, [fetchApplications]);

    const handleOrderOfPayment = useCallback((application) => {
        setSelectedOrderOfPaymentApp(application);
        setIsOrderOfPaymentModalOpen(true);
    }, []);

    const handleUndoStatus = useCallback((applicationId) => {
        setConfirmationModal({
            isOpen: true,
            type: 'undo',
            applicationId,
            title: 'Undo Status',
            message: "Are you sure you want to undo the status of this application? It will be set back to In Progress. This action cannot be undone."
        });
    }, []);

    const handleConfirmAction = useCallback(async () => {
        const { type, applicationId } = confirmationModal;
        setConfirmationModal({ isOpen: false, type: null, applicationId: null, title: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            if (type === 'undo') {
                const response = await axios.put(`http://localhost:3000/api/admin/undo-status/${applicationId}`,
                    { newStatus: 'In Progress' },
                    { headers: { Authorization: token } }
                );
                if (response.data.success) {
                    toast.success('Application status undone successfully');
                    fetchApplications(); // Refresh the applications list
                } else {
                    toast.error('Failed to undo application status');
                }
            } else if (type === 'delete') {
                await axios.delete(`http://localhost:3000/api/csaw_deleteApplication/${applicationId}`, {
                    headers: { Authorization: token }
                });
                toast.success('Application deleted successfully');
                fetchApplications();
            }
        } catch (error) {
            console.error(`Error ${type === 'undo' ? 'undoing status' : 'deleting application'}:`, error);
            toast.error(`Failed to ${type === 'undo' ? 'undo status' : 'delete application'}`);
        }
    }, [confirmationModal, fetchApplications]);

    const onUpdateStatus = useCallback((applicationId, newStatus) => {
        setApplications(prevApplications =>
            prevApplications.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            )
        );
    }, []);

    const getStatusColor = useCallback((status) => {
        switch (status.toLowerCase()) {
            case 'for review':
                return 'bg-yellow-100 text-yellow-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'returned':
                return 'bg-orange-100 text-orange-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'released':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-red-100 text-red-800';
        }
    }, []);

    const filteredApplications = useMemo(() => {
        return applications.filter(app =>
            app.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [applications, searchTerm]);

    const renderTable = useMemo(() => {
        if (loading) {
            return <p className="text-center text-gray-500">Loading applications...</p>;
        }

        if (error) {
            return <p className="text-center text-red-500">{error}</p>;
        }

        if (filteredApplications.length === 0) {
            return <p className="text-center text-gray-500">No applications found.</p>;
        }

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
                            <ApplicationRow
                                key={app._id}
                                app={app}
                                onView={handleView}
                                onPrint={handlePrint}
                                onReview={handleReview}
                                onOrderOfPayment={handleOrderOfPayment}
                                onUndoStatus={handleUndoStatus}
                                getStatusColor={getStatusColor}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }, [loading, error, filteredApplications, handleView, handlePrint, handleReview, handleOrderOfPayment, handleUndoStatus, getStatusColor]);

    return (
        <div className="min-h-screen bg-green-50">
            <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-green-800">All Applications</h1>
                    <Button onClick={fetchApplications} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
                {/* Tab Buttons */}
                <div className="mb-6 overflow-x-auto">
                    <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                        {['For Review', 'In Progress', 'Returned', 'Accepted', 'Released', 'Rejected'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                                    activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'
                                }`}
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
                {renderTable}
            </div>

            {/* Modals */}
            <ChiefRPSApplicationViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                application={selectedApplication}
                onUpdateStatus={handleStatusUpdate}
            />

            <ChiefRPSApplicationReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                application={selectedApplication}
                onUpdateStatus={handleStatusUpdate}
            />

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({ isOpen: false, type: null, applicationId: null, title: '', message: '' })}
                onConfirm={handleConfirmAction}
                title={confirmationModal.title}
                message={confirmationModal.message}
            />

            <OrderOfPaymentModal
                isOpen={isOrderOfPaymentModalOpen}
                onClose={() => setIsOrderOfPaymentModalOpen(false)}
                application={selectedOrderOfPaymentApp}
            />
        </div>
    );
};

export default React.memo(ChiefRPSDashboard);
