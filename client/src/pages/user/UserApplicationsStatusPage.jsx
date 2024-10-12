import React, { useState, useMemo } from 'react';
import { RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import EditApplicationModal from '../../components/ui/EditApplicationModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import UserOOPviewModal from './components/UserOOPviewModal';
import PaymentSimulationModal from './components/PaymentSimulationModal';
import { Button } from '@/components/ui/button';
import UserApplicationRow from './components/UserApplicationRow';
import { useUserApplications } from './hooks/useUserApplications';
import { useUserApplicationActions } from './hooks/useUserApplicationActions';

const UserApplicationsStatusPage = () => {
   const [activeTab, setActiveTab] = useState('Submitted');
   const [searchTerm, setSearchTerm] = useState('');
   const [sortConfig, setSortConfig] = useState(null);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, type: null, application: null });
   const [isOOPModalOpen, setIsOOPModalOpen] = useState(false);
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [selectedPaymentApplication, setSelectedPaymentApplication] = useState(null);

   const { applications, loading, error, fetchApplications, handleStatusUpdate } = useUserApplications(activeTab);
   const { handleView, handleEdit, handleSubmitDraft, handleUnsubmit, handleDelete, handleViewOOP, handleSimulatePayment } = useUserApplicationActions(fetchApplications);

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

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

   const renderTable = () => {
      if (loading) {
         return <p className="text-center text-gray-500">Loading applications...</p>;
      }

      if (error) {
         return <p className="text-center text-red-500">{error}</p>;
      }

      if (filteredApplications.length === 0) {
         return <p className="text-center text-gray-500">No applications found.</p>;
      }

      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('customId')}>
                        APPLICATION NUMBER {renderSortIcon('customId')}
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        APPLICATION TYPE
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
                  {filteredApplications.map((app) => (
                     <UserApplicationRow
                        key={app._id}
                        app={app}
                        onView={onView}
                        onEdit={onEdit}
                        onSubmitDraft={onSubmitDraft}
                        onUnsubmit={onUnsubmit}
                        onDelete={onDelete}
                        onViewOOP={handleViewOOP}
                        onSimulatePayment={handleSimulatePayment}
                        getStatusColor={getStatusColor}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">My Applications</h1>
               <Button onClick={fetchApplications} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {['Draft', 'Submitted', 'Returned', 'Accepted', 'Awaiting Payment', 'Released', 'Expired', 'Rejected'].map((tab) => (
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
            <div className="mb-6">
               <input
                  type="text"
                  placeholder="Search applications..."
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
            onUpdate={handleStatusUpdate}
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
            applicationId={selectedApplication?.customId}
         />

         <PaymentSimulationModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentComplete={handleSimulatePayment}
            totalAmount={selectedPaymentApplication?.totalAmount || 0}
            applicationId={selectedPaymentApplication?.customId}
         />
      </div>
   );
};


export default UserApplicationsStatusPage;
