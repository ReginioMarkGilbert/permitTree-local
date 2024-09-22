import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Leaf, X } from 'lucide-react';

const AdminApplicationReviewPage = () => {
    const [application, setApplication] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [returnRemarks, setReturnRemarks] = useState('');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/getApplicationById/${id}`, {
                headers: { Authorization: token }
            });
            setApplication(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching application:', error);
            toast.error('Failed to fetch application details');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/admin/update-status/${id}`,
                { status: newStatus, reviewNotes },
                { headers: { Authorization: token } }
            );
            toast.success(`Application status updated to ${newStatus}`);
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error('Failed to update application status');
        }
    };

    const handleReturn = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/admin/return-application/${id}`,
                { returnRemarks },
                { headers: { Authorization: token } }
            );
            toast.success('Application returned to user');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Error returning application:', error);
            toast.error('Failed to return application');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!application) {
        return <div>Application not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Application Review</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-xl font-semibold mb-2">Application Details</h2>
                <p><strong>ID:</strong> {application.customId}</p>
                <p><strong>Type:</strong> {application.applicationType}</p>
                <p><strong>Status:</strong> {application.status}</p>
                <p><strong>Owner Name:</strong> {application.ownerName}</p>
                <p><strong>Address:</strong> {application.address}</p>
                <p><strong>Phone:</strong> {application.phone}</p>
                <p><strong>Brand:</strong> {application.brand}</p>
                <p><strong>Model:</strong> {application.model}</p>
                <p><strong>Serial Number:</strong> {application.serialNumber}</p>
                <p><strong>Date of Acquisition:</strong> {new Date(application.dateOfAcquisition).toLocaleDateString()}</p>
                <p><strong>Power Output:</strong> {application.powerOutput}</p>
                <p><strong>Max Length Guidebar:</strong> {application.maxLengthGuidebar}</p>
                <p><strong>Country of Origin:</strong> {application.countryOfOrigin}</p>
                <p><strong>Purchase Price:</strong> {application.purchasePrice}</p>

                <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reviewNotes">
                        Review Notes
                    </label>
                    <textarea
                        id="reviewNotes"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows="4"
                    ></textarea>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleStatusUpdate('In Progress')}
                    >
                        Mark as In Progress
                    </button>
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleStatusUpdate('Accepted')}
                    >
                        Accept
                    </button>
                    <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setShowReturnModal(true)}
                    >
                        Return
                    </button>
                </div>
            </div>

            {showReturnModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Return Application</h3>
                            <div className="mt-2 px-7 py-3">
                                <textarea
                                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                                    rows="4"
                                    placeholder="Enter return remarks..."
                                    value={returnRemarks}
                                    onChange={(e) => setReturnRemarks(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    className="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    onClick={handleReturn}
                                >
                                    Return Application to User
                                </button>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    onClick={() => setShowReturnModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplicationReviewPage;
