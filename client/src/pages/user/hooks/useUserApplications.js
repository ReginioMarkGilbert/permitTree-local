import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useUserApplications = (activeTab) => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchApplications = useCallback(async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const response = await axios.get('http://localhost:3000/api/getAllApplications', {
            params: { status: activeTab },
            headers: { Authorization: token }
         });
         setApplications(response.data);
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

   const handleStatusUpdate = useCallback((updatedApplication) => {
      setApplications(prevApplications =>
         prevApplications.map(app =>
            app._id === updatedApplication._id ? updatedApplication : app
         )
      );
      fetchApplications();
   }, [fetchApplications]);

   return { applications, loading, error, fetchApplications, handleStatusUpdate };
};
