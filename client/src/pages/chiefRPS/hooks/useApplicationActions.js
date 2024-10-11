import { useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useApplicationActions = (fetchApplications) => {
    const handleView = useCallback(async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/getApplicationById/${id}`, {
                headers: { Authorization: token }
            });
            return { data: response.data, status };
        } catch (error) {
            console.error('Error fetching application details:', error);
            toast.error('Failed to fetch application details');
            throw error;
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

    const handleUndoStatus = useCallback(async (applicationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3000/api/admin/undo-status/${applicationId}`,
                { newStatus: 'In Progress' },
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                toast.success('Application status undone successfully');
                fetchApplications();
            } else {
                toast.error('Failed to undo application status');
            }
        } catch (error) {
            console.error('Error undoing application status:', error);
            toast.error('Failed to undo application status');
        }
    }, [fetchApplications]);

    return { handleView, handlePrint, handleReview, handleUndoStatus };
};
