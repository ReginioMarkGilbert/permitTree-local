import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useUserApplicationActions = (fetchApplications) => {
   const getAuthHeader = () => {
      const token = localStorage.getItem('token');
      return token ? { Authorization: token } : {};
   };

   const handleView = async (id) => {
      try {
         const response = await axios.get(`http://localhost:3000/api/csaw_getApplicationById/${id}`, {
            headers: getAuthHeader()
         });
         return response.data;
      } catch (error) {
         console.error('Error fetching application details:', error);
         toast.error('Failed to fetch application details');
         throw error;
      }
   };

   const handleEdit = async (application) => {
      try {
         const response = await axios.put(`http://localhost:3000/api/csaw_updateApplication/${application._id}`, application, {
            headers: getAuthHeader()
         });
         if (response.data.success) {
            toast.success('Application updated successfully');
            fetchApplications();
            return response.data.application;
         } else {
            toast.error('Failed to update application');
            throw new Error('Failed to update application');
         }
      } catch (error) {
         console.error('Error updating application:', error);
         toast.error('Failed to update application');
         throw error;
      }
   };

   const handleSubmitDraft = async (application) => {
      try {
         const response = await axios.put(`http://localhost:3000/api/csaw_submitDraft/${application._id}`, {}, {
            headers: getAuthHeader()
         });
         if (response.data.success) {
            toast.success('Application submitted successfully');
            fetchApplications();
         } else {
            toast.error('Failed to submit application');
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         toast.error('Failed to submit application');
         throw error;
      }
   };

   const handleUnsubmit = async (application) => {
      try {
         const response = await axios.put(`http://localhost:3000/api/csaw_unsubmitApplication/${application._id}`, {}, {
            headers: getAuthHeader()
         });
         if (response.data.success) {
            toast.success('Application unsubmitted successfully');
            fetchApplications();
         } else {
            toast.error('Failed to unsubmit application');
         }
      } catch (error) {
         console.error('Error unsubmitting application:', error);
         toast.error('Failed to unsubmit application');
         throw error;
      }
   };

   const handleDelete = async (application) => {
      try {
         const response = await axios.delete(`http://localhost:3000/api/csaw_deleteApplication/${application._id}`, {
            headers: getAuthHeader()
         });
         if (response.data.success) {
            toast.success('Application deleted successfully');
            fetchApplications();
         } else {
            toast.error('Failed to delete application');
         }
      } catch (error) {
         console.error('Error deleting application:', error);
         toast.error('Failed to delete application');
         throw error;
      }
   };

   const handleViewOOP = useCallback(async (billNo) => {
      try {
         const token = localStorage.getItem('token');
         const response = await axios.get(`http://localhost:3000/api/user/oop-by-billno/${billNo}`, {
            headers: { Authorization: token }
         });
         return response.data;
      } catch (error) {
         console.error('Error fetching Order of Payment:', error);
         toast.error('Failed to fetch Order of Payment details');
         throw error;
      }
   }, []);

   const handleSimulatePayment = async (application) => {
      try {
         const response = await axios.post(`http://localhost:3000/api/user/oop/${application._id}/simulate-payment`, {}, {
            headers: getAuthHeader()
         });
         if (response.data.success) {
            toast.success('Payment simulation completed');
            fetchApplications();
            return response.data.updatedApplication;
         } else {
            toast.error('Failed to simulate payment');
            throw new Error('Failed to simulate payment');
         }
      } catch (error) {
         console.error('Error simulating payment:', error);
         toast.error('Failed to simulate payment');
         throw error;
      }
   };

   return {
      handleView,
      handleEdit,
      handleSubmitDraft,
      handleUnsubmit,
      handleDelete,
      handleViewOOP,
      handleSimulatePayment
   };
};
