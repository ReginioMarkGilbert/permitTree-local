import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import EditApplicationModal from '../../components/ui/EditApplicationModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import UserOOPviewModal from './components/UserOOPviewModal';
import PaymentSimulationModal from './components/PaymentSimulationModal';
import { Button } from '@/components/ui/button';
import UserApplicationRow from './components/UserApplicationRow';
import UserOrderOfPaymentRow from './components/UserOrderOfPaymentRow';
import { useUserApplications } from './hooks/useUserApplications';
import { useUserOrderOfPayments } from './hooks/useUserOrderOfPayments';
import { useUserApplicationActions } from './hooks/useUserApplicationActions';

const UserApplicationsStatusPage = () => {
   const [mainTab, setMainTab] = useState('Applications');
   const [activeTab, setActiveTab] = useState('Draft'); // Change this to 'Draft' for Applications
   const [searchTerm, setSearchTerm] = useState('');
   const [sortConfig, setSortConfig] = useState(null);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, type: null, application: null });
   const [isOOPModalOpen, setIsOOPModalOpen] = useState(false);
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [selectedPaymentApplication, setSelectedPaymentApplication] = useState(null);
   const [selectedOOP, setSelectedOOP] = useState(null);

   const { applications, loading: appLoading, error: appError, fetchApplications, handleStatusUpdate: handleAppStatusUpdate } = useUserApplications(mainTab === 'Applications' ? activeTab : null);
   const { orderOfPayments, loading: oopLoading, error: oopError, fetchOrderOfPayments, handleStatusUpdate: handleOOPStatusUpdate } = useUserOrderOfPayments(activeTab);
   const { handleView, handleEdit, handleSubmitDraft, handleUnsubmit, handleDelete, handleViewOOP, handleSimulatePayment } = useUserApplicationActions(fetchApplications);
   // const { handleSimulatePayment } = useUserOrderOfPayments();

   const applicationTabs = ['Draft', 'Submitted', 'Returned', 'Accepted', 'Released', 'Expired', 'Rejected'];
   const oopTabs = ['Awaiting Payment', 'Payment Proof Submitted', 'Returned', 'Approved', 'Completed'];

   const filteredItems = useMemo(() => {
      const items = mainTab === 'Applications' ? applications : orderOfPayments;
      return items.filter(item =>
         item.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (item.applicationType && item.applicationType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
   }, [mainTab, applications, orderOfPayments, searchTerm]);

   const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
         direction = 'desc';
      }
      setSortConfig({ key, direction });
   };

   const renderSortIcon = (key) => {
      if (sortConfig?.key === key) {
         return sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
      }
      return null;
   };

   const onView = async (id) => {
      const result = await handleView(id);
      setSelectedApplication(result);
      setIsViewModalOpen(true);
   };

   const onEdit = (application) => {
      setSelectedApplication(application);
      setIsEditModalOpen(true);
   };

   const onSubmitDraft = (application) => {
      setConfirmationModal({
         isOpen: true,
         type: 'submit',
         application,
         title: 'Submit Application',
         message: "Are you sure you want to submit this draft application? Once submitted, you won't be able to edit it further."
      });
   };

   const onUnsubmit = (application) => {
      setConfirmationModal({
         isOpen: true,
         type: 'unsubmit',
         application,
         title: 'Unsubmit Application',
         message: "Are you sure you want to unsubmit this application? It will be moved back to drafts."
      });
   };

   const onDelete = (application) => {
      setConfirmationModal({
         isOpen: true,
         type: 'delete',
         application,
         title: 'Delete Application',
         message: "Are you sure you want to delete this draft application? This action cannot be undone."
      });
   };

   const handleConfirmAction = async () => {
      const { type, application } = confirmationModal;
      setConfirmationModal({ isOpen: false, type: null, application: null });

      try {
         if (type === 'submit') {
            await handleSubmitDraft(application);
         } else if (type === 'unsubmit') {
            await handleUnsubmit(application);
         } else if (type === 'delete') {
            await handleDelete(application);
         }
      } catch (error) {
         console.error(`Error ${type}ing application:`, error);
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Draft': return 'bg-gray-100 text-gray-800';
         case 'Submitted': return 'bg-blue-100 text-blue-800';
         case 'Returned': return 'bg-yellow-100 text-yellow-800';
         case 'Accepted': return 'bg-green-100 text-green-800';
         case 'Awaiting Payment': return 'bg-purple-100 text-purple-800';
         case 'Released': return 'bg-indigo-100 text-indigo-800';
         case 'Expired': return 'bg-red-100 text-red-800';
         case 'Rejected': return 'bg-red-100 text-red-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const renderTabs = () => {
      const tabs = mainTab === 'Applications' ? applicationTabs : oopTabs;
      return (
         <div className="mb-6 overflow-x-auto">
            <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
               {tabs.map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>
      );
   };

   const renderTable = () => {
      const loading = mainTab === 'Applications' ? appLoading : oopLoading;
      const error = mainTab === 'Applications' ? appError : oopError;

      if (loading) {
         return <p className="text-center text-gray-500">Loading...</p>;
      }

      if (error) {
         return <p className="text-center text-red-500">{error}</p>;
      }

      if (filteredItems.length === 0) {
         return <p className="text-center text-gray-500">No items found.</p>;
      }

      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('customId')}>
                        {mainTab === 'Applications' ? 'APPLICATION NUMBER' : 'OOP NUMBER'} {renderSortIcon('customId')}
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        {mainTab === 'Applications' ? 'APPLICATION TYPE' : 'TOTAL AMOUNT'}
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden sm:table-cell" onClick={() => handleSort('dateOfSubmission')}>
                        DATE  {renderSortIcon('dateOfSubmission')}
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                     mainTab === 'Applications' ? (
                        <UserApplicationRow
                           key={item._id}
                           app={item}
                           onView={onView}
                           onEdit={onEdit}
                           onSubmitDraft={onSubmitDraft}
                           onUnsubmit={onUnsubmit}
                           onDelete={onDelete}
                           onViewOOP={onViewOOP}
                           onSimulatePayment={onSimulatePayment}
                           getStatusColor={getStatusColor}
                        />
                     ) : (
                        <UserOrderOfPaymentRow
                           key={item._id}
                           oop={item}
                           onView={onViewOOP}
                           onSimulatePayment={onSimulatePayment}
                           getStatusColor={getStatusColor}
                        />
                     )
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const onViewOOP = async (billNo) => {
      const result = await handleViewOOP(billNo);
      setSelectedOOP(result);
      setIsOOPModalOpen(true);
   };

   // const onSimulatePayment = useCallback((application) => {
   //    setSelectedPaymentApplication(application);
   //    setIsPaymentModalOpen(true);
   // }, []);

   const onSimulatePayment = async (billNo) => {
      const result = await handleViewOOP(billNo);
      setSelectedPaymentApplication(result);
      setIsPaymentModalOpen(true);
   };

   const handlePaymentComplete = useCallback(async (paymentDetails) => {
      if (selectedPaymentApplication) {
         try {
            const paymentResult = await handleSimulatePayment(selectedPaymentApplication.billNo, paymentDetails);
            setIsPaymentModalOpen(false);
            fetchOrderOfPayments(); // Refresh the OOP list
            // No need to update totalAmount here, it's already fetched in handleSimulatePayment
            console.log("Payment successful:", paymentResult);
         } catch (error) {
            console.error('Error processing payment:', error);
         }
      }
   }, [selectedPaymentApplication, handleSimulatePayment, fetchOrderOfPayments]);

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">My Applications</h1>
               <Button onClick={mainTab === 'Applications' ? fetchApplications : fetchOrderOfPayments} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>
            <div className="mb-6">
               <div className="bg-white p-1 rounded-md inline-flex">
                  <button
                     onClick={() => { setMainTab('Applications'); setActiveTab('Draft'); }}
                     className={`px-4 py-2 rounded-md text-sm font-medium ${mainTab === 'Applications' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                     Applications
                  </button>
                  <button
                     onClick={() => {
                        setMainTab('Order Of Payments');
                        setActiveTab('Awaiting Payment'); // Set to 'Awaiting Payment' for OOPs
                     }}
                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${mainTab === 'Order Of Payments' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                  >
                     Order Of Payments
                  </button>
               </div>
            </div>
            {renderTabs()}
            <div className="mb-6">
               <input
                  type="text"
                  placeholder={`Search ${mainTab.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>
            {renderTable()}
         </div>

         <ApplicationDetailsModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={selectedApplication}
         />

         <EditApplicationModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            application={selectedApplication}
            onUpdate={handleAppStatusUpdate}
         />

         <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={() => setConfirmationModal({ isOpen: false, type: null, application: null })}
            onConfirm={handleConfirmAction}
            title={confirmationModal.title}
            message={confirmationModal.message}
         />

         <UserOOPviewModal
            isOpen={isOOPModalOpen}
            onClose={() => setIsOOPModalOpen(false)}
            billNo={selectedOOP?.billNo}
         />

         <PaymentSimulationModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentComplete={handlePaymentComplete}
            totalAmount={selectedPaymentApplication?.totalAmount || 0}
            applicationId={selectedPaymentApplication?.customId}
            billNo={selectedPaymentApplication?.billNo}
         />
      </div>
   );
};

export default UserApplicationsStatusPage;
