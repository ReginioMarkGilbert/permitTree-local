import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useOrderOfPayments = (activeTab) => {
   const [orderOfPayments, setOrderOfPayments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchOrderOfPayments = useCallback(async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const response = await axios.get('http://localhost:3000/api/admin/order-of-payments', {
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

   return { orderOfPayments, loading, error, fetchOrderOfPayments };
};
