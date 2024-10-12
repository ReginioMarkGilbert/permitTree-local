import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useUserOrderOfPayments = (activeTab) => {
   const [orderOfPayments, setOrderOfPayments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchOrderOfPayments = useCallback(async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const response = await axios.get('http://localhost:3000/api/getAllApplications', {
            params: { status: activeTab },
            headers: { Authorization: token }
         });
         setOrderOfPayments(response.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching order of payments:', error);
         setError('Failed to fetch order of payments');
         setLoading(false);
         toast.error('Failed to fetch order of payments');
      }
   }, [activeTab]);

   useEffect(() => {
      fetchOrderOfPayments();
   }, [fetchOrderOfPayments]);

   const handleStatusUpdate = useCallback((updatedOOP) => {
      setOrderOfPayments(prevOOPs =>
         prevOOPs.map(oop =>
            oop._id === updatedOOP._id ? updatedOOP : oop
         )
      );
      fetchOrderOfPayments();
   }, [fetchOrderOfPayments]);

   return { orderOfPayments, loading, error, fetchOrderOfPayments, handleStatusUpdate };
};
