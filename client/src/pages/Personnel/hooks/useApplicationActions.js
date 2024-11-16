import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useApplicationActions = (fetchApplications) => {
   const getAuthHeader = () => {
      const token = localStorage.getItem('token');
      return token ? { Authorization: token } : {};
   };

   const handleView = async (id, status) => {
      try {
         const response = await axios.get(`http://localhost:3000/api/admin/getApplicationById/${id}`, {
            headers: getAuthHeader()
         });
         return { data: response.data, status };
      } catch (error) {
         console.error('Error fetching application details:', error);
         toast.error('Failed to fetch application details');
         throw error;
      }
   };

   const handlePrint = async (id) => {
      try {
         const response = await axios.get(`http://localhost:3000/api/admin/print/${id}`, {
            headers: getAuthHeader(),
            responseType: 'blob',
         });

         const blob = new Blob([response.data], { type: 'application/pdf' });
         const url = window.URL.createObjectURL(blob);
         window.open(url);
      } catch (error) {
         console.error('Error printing application:', error);
         toast.error('Failed to print application');
      }
   };

   const handleReview = async (applicationId) => {
      try {
         const response = await axios.post(`http://localhost:3000/api/admin/review-application/${applicationId}`, {}, {
            headers: getAuthHeader()
         });

         if (response.data.success) {
            toast.success('Application marked as In Progress');
            fetchApplications();
         } else {
            toast.error(response.data.message || 'Failed to update application status');
         }
      } catch (error) {
         console.error('Error updating application status:', error.response || error);
         toast.error(error.response?.data?.message || 'Failed to update application status');
         throw error;
      }
   };

   const handleOrderOfPayment = (application) => {
      // Implement order of payment logic here
      return application;
   };

   const handleUndoStatus = async (applicationId) => {
      try {
         const response = await axios.put(`http://localhost:3000/api/admin/undo-status/${applicationId}`,
            { newStatus: 'In Progress' },
            { headers: getAuthHeader() }
         );

         if (response.data.success) {
            toast.success('Application status undone successfully');
            fetchApplications();
         } else {
            toast.error(response.data.message || 'Failed to undo application status');
         }
      } catch (error) {
         console.error('Error undoing application status:', error.response || error);
         toast.error(error.response?.data?.message || 'Failed to undo application status');
         throw error;
      }
   };

   return {
      handleView,
      handlePrint,
      handleReview,
      handleOrderOfPayment,
      handleUndoStatus
   };
};
