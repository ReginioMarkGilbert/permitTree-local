import React, { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChiefRPSApplicationReviewModal from './components/ChiefRPSApplicationReviewModal';
import ChiefRPSApplicationViewModal from './components/ChiefRPSApplicationViewModal';
import OrderOfPaymentModal from './components/OrderOfPaymentModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ApplicationRow from './components/ApplicationRow';
import { useApplications } from './hooks/useApplications';
import { useApplicationActions } from './hooks/useApplicationActions';

const ChiefRPSDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('For Review');
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isOrderOfPaymentModalOpen, setIsOrderOfPaymentModalOpen] = useState(false);
   const [selectedOrderOfPaymentApp, setSelectedOrderOfPaymentApp] = useState(null);
   const [confirmationModal, setConfirmationModal] = useState({
      isOpen: false,
      type: null,
      applicationId: null,
      title: '',
      message: ''
   });
   const [reviewConfirmation, setReviewConfirmation] = useState({ isOpen: false, applicationId: null });

   const { applications, loading, error, fetchApplications, handleStatusUpdate } = useApplications(activeTab);
   const { handleView, handlePrint, handleReview, handleOrderOfPayment, handleUndoStatus } = useApplicationActions(fetchApplications);

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'for review': return 'bg-yellow-100 text-yellow-800';
         case 'in progress': return 'bg-blue-100 text-blue-800';
         case 'returned': return 'bg-orange-100 text-orange-800';
         case 'accepted': return 'bg-green-100 text-green-800';
         case 'released': return 'bg-purple-100 text-purple-800';
         default: return 'bg-red-100 text-red-800';
      }
   };

   const onView = async (id, status) => {
      const result = await handleView(id, status);
      setSelectedApplication(result.data);
      if (result.status === 'In Progress') {
         setIsReviewModalOpen(true);
      } else {
         setIsViewModalOpen(true);
      }
   };

   const onOrderOfPayment = (application) => {
      setSelectedOrderOfPaymentApp(handleOrderOfPayment(application));
      setIsOrderOfPaymentModalOpen(true);
   };

   const onUndoStatus = useCallback((applicationId) => {
      setConfirmationModal({
         isOpen: true,
         type: 'undo',
         applicationId,
         title: 'Undo Status',
         message: "Are you sure you want to undo the status of this application? It will be set back to In Progress. This action cannot be undone."
      });
   }, []);

   const handleConfirmAction = async () => {
      if (confirmationModal.type === 'undo') {
         try {
            await handleUndoStatus(confirmationModal.applicationId);
            fetchApplications(); // Refresh the applications list
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
         } catch (error) {
            console.error('Error undoing status:', error);
         }
      }
   };

   const confirmReview = () => {
      setReviewConfirmation({ isOpen: true, applicationId: null });
   };

   const handleConfirmReview = () => {
      if (reviewConfirmation.applicationId) {
         handleReview(reviewConfirmation.applicationId);
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
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION NUMBER</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION TYPE</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                     <ApplicationRow
                        key={app._id}
                        app={app}
                        onView={onView}
                        onPrint={handlePrint}
                        onReview={handleReview}
                        onOrderOfPayment={onOrderOfPayment}
                        onUndoStatus={onUndoStatus}
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
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">All Applications</h1>
               <Button onClick={fetchApplications} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {['For Review', 'In Progress', 'Returned', 'Accepted', 'Released', 'Rejected'].map((tab) => (
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

         <ChiefRPSApplicationViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={selectedApplication}
            onUpdateStatus={handleStatusUpdate}
         />

         <ChiefRPSApplicationReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={selectedApplication}
            onUpdateStatus={handleStatusUpdate}
         />

         <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={() => setConfirmationModal({ isOpen: false, type: null, applicationId: null, title: '', message: '' })}
            onConfirm={handleConfirmAction}
            title={confirmationModal.title}
            message={confirmationModal.message}
         />

         <ConfirmationModal
            isOpen={reviewConfirmation.isOpen}
            onClose={() => setReviewConfirmation({ isOpen: false, applicationId: null })}
            onConfirm={handleConfirmReview}
            title="Confirm Review"
            message="Are you sure you want to mark this application as In Progress? This application will be forwarded to the chief RPS"
         />

         <OrderOfPaymentModal
            isOpen={isOrderOfPaymentModalOpen}
            onClose={() => setIsOrderOfPaymentModalOpen(false)}
            application={selectedOrderOfPaymentApp}
         />
      </div>
   );
};

export default React.memo(ChiefRPSDashboard);
