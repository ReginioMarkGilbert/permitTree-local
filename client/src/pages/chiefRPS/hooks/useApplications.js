import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useApplications = (activeTab) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return { applications, loading, error, fetchApplications, setApplications };
};
