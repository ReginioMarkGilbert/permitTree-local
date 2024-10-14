import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useUserOrderOfPayments = (status) => {
   const [orderOfPayments, setOrderOfPayments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchOrderOfPayments = useCallback(async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const response = await axios.get('http://localhost:3000/api/user/oop', {
            params: { status },
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
   }, [status]);

   useEffect(() => {
      fetchOrderOfPayments();
   }, [fetchOrderOfPayments]);

   const handleSimulatePayment = async (billNo, paymentDetails) => {
      try {
         const token = localStorage.getItem('token');
         const response = await axios.post(`http://localhost:3000/api/user/oop/${billNo}/simulate-payment`, paymentDetails, {
            headers: { Authorization: token }
         });
         toast.success('Payment simulated successfully');
         return response.data;
      } catch (error) {
         console.error('Error simulating payment:', error);
         toast.error('Failed to simulate payment');
         throw error; // Rethrow the error to be caught in the component
      }
   };
   const getTotalAmount = async (billNo) => {
      try {
         const token = localStorage.getItem('token');
         const response = await axios.get(`http://localhost:3000/api/user/oop/${billNo}`, {
            headers: { Authorization: token }
         });
         return response.data.totalAmount;
      } catch (error) {
         console.error('Error fetching total amount:', error);
         toast.error('Failed to fetch total amount');
         throw error;
      }
   };

   return { orderOfPayments, loading, error, fetchOrderOfPayments, handleSimulatePayment, getTotalAmount };
};
