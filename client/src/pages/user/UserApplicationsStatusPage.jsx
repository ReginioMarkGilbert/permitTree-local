import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserApplicationRow from './components/UserApplicationRow';
import { useUserApplications } from './hooks/useUserApplications';
import { toast } from 'sonner';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUserOrderOfPayments } from './hooks/useUserOrderOfPayments';
import { getUserId } from '@/utils/auth';
import UserOOPRow from './components/UserOOPRow';
import { gql } from 'graphql-tag';

const GET_OOP_DETAILS = gql`
  query GetOOPDetails($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      namePayee
      address
      natureOfApplication
      items {
        legalBasis
        description
        amount
      }
      totalAmount
      OOPstatus
      OOPSignedByTwoSignatories
      rpsSignatureImage
      tsdSignatureImage
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
      createdAt
      updatedAt
    }
  }
`;

const UserApplicationsStatusPage = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Draft');
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [applicationToDelete, setApplicationToDelete] = useState(null);
   const [unsubmitDialogOpen, setUnsubmitDialogOpen] = useState(false);
   const [applicationToUnsubmit, setApplicationToUnsubmit] = useState(null);
   const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
   const [applicationToSubmit, setApplicationToSubmit] = useState(null);
   const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
   const [applicationToResubmit, setApplicationToResubmit] = useState(null);

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         // Applications
         case 'Draft': return { status: 'Draft' };
         case 'Submitted': return { status: 'Submitted' };
         case 'Returned': return { status: 'Returned', currentStage: 'ReturnedByTechnicalStaff' };
         case 'Accepted': return { status: 'Accepted' };
         case 'Released': return { status: 'Released' };
         case 'Expired': return { status: 'Expired' };
         case 'Rejected': return { status: 'Rejected' };
         // Order of Payments - Map to backend statuses
         case 'Awaiting Payment': return { status: 'Awaiting Payment' };
         case 'Payment Proof Submitted': return { status: 'Payment Proof Submitted' };
         case 'Payment Proof Rejected': return { status: 'Payment Proof Rejected' };
         case 'Payment Proof Approved': return { status: 'Payment Proof Approved' };
         case 'Issued OR': return { status: 'Issued OR' };
         case 'Completed': return { status: 'Completed OOP' };
         // Renewals
         case 'Renewed': return { status: 'Renewed', isRenewal: true };
         default: return { status: 'Submitted' };
      }
   };

   const {
      applications,
      loading,
      error,
      refetch,
      fetchUserApplications,
      deletePermit,
      updateCSAWPermit,
      updateCOVPermit,
      updatePLTCPPermit,
      updatePTPRPermit,
      updatePLTPPermit,
      fetchCOVPermit,
      fetchCSAWPermit,
      fetchPLTCPPermit,
      fetchPTPRPermit,
      fetchPLTPPermit,
      unsubmitPermit,
      submitPermit,
      updateTCEBPPermit,
      fetchTCEBPPermit,
      resubmitPermit,
   } = useUserApplications(
      getQueryParamsForTab(activeSubTab).status,
      getQueryParamsForTab(activeSubTab).currentStage
   );

   const mainTabs = ['Applications', 'Order Of Payments', 'Renewals'];
   const subTabs = {
      'Applications': ['Draft', 'Submitted', 'Returned', 'Accepted', 'Released', 'Expired', 'Rejected'],
      'Order Of Payments': ['Awaiting Payment', 'Payment Proof Submitted', 'Payment Proof Rejected', 'Payment Proof Approved', 'Completed', 'Issued OR'],
      'Renewals': ['Draft', 'Submitted', 'Returned', 'Renewed', 'Rejected']
   };

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

   useEffect(() => {
      const { status, currentStage } = getQueryParamsForTab(activeSubTab);
      fetchUserApplications(status, currentStage);
   }, [fetchUserApplications, activeSubTab]);

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'draft': return 'bg-gray-100 text-gray-800';
         case 'submitted': return 'bg-blue-100 text-blue-800';
         case 'returned': return 'bg-yellow-100 text-yellow-800';
         case 'accepted': return 'bg-green-100 text-green-800';
         case 'released': return 'bg-indigo-100 text-indigo-800';
         case 'expired': return 'bg-red-100 text-red-800';
         case 'rejected': return 'bg-red-100 text-red-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   useEffect(() => {
      // console.log('UserApplicationsStatusPage useEffect triggered. ActiveSubTab:', activeSubTab);
      refetch();
   }, [activeSubTab, refetch]);

   // useEffect(() => {
   //    console.log('Applications data changed:', applications);
   // }, [applications]);

   const handleDeleteClick = (application) => {
      console.log('Delete clicked for application:', application);
      setApplicationToDelete(application);
      setDeleteDialogOpen(true);
   };

   const handleDeleteConfirm = async () => {
      console.log('Confirming delete for application:', applicationToDelete);
      if (applicationToDelete) {
         try {
            await deletePermit(applicationToDelete.id);
            console.log('Delete successful');
            toast.success('Draft deleted successfully');
            setDeleteDialogOpen(false);
            setApplicationToDelete(null);
            refetch();
         } catch (error) {
            console.error('Error deleting draft:', error);
            toast.error(`Error deleting draft: ${error.message || 'Unknown error occurred'}`);
         }
      }
   };

   const handleEditApplication = async (id, editedData) => {
      try {
         console.log('Attempting to edit application:', id);
         console.log('Edited data:', editedData);

         if (!editedData.applicationType) {
            console.error('Application type is undefined:', editedData);
            throw new Error('Application type is undefined');
         }

         let updateFunction;
         switch (editedData.applicationType) {
            case 'Chainsaw Registration':
               updateFunction = updateCSAWPermit;
               break;
            case 'Certificate of Verification':
               updateFunction = updateCOVPermit;
               break;
            case 'Private Tree Plantation Registration':
               updateFunction = updatePTPRPermit;
               break;
            case 'Public Land Tree Cutting Permit':
               updateFunction = updatePLTCPPermit;
               break;
            case 'Special/Private Land Timber Permit':
               updateFunction = updatePLTPPermit;
               break;
            case 'Tree Cutting and/or Earth Balling Permit':
               updateFunction = updateTCEBPPermit;
               break;
            default:
               console.error('Unsupported application type:', editedData.applicationType);
               throw new Error(`Unsupported application type: ${editedData.applicationType}`);
         }

         await updateFunction(id, editedData);
         toast.success('Application updated successfully');
         refetch();
      } catch (error) {
         console.error('Error updating application:', error);
         toast.error(`Error updating application: ${error.message || 'Unknown error occurred'}`);
      }
   };

   const handleUnsubmitClick = (application) => {
      setApplicationToUnsubmit(application);
      setUnsubmitDialogOpen(true);
   };

   const handleUnsubmitConfirm = async () => {
      if (applicationToUnsubmit) {
         try {
            await unsubmitPermit(applicationToUnsubmit.id);
            toast.success('Application unsubmitted successfully');
            setUnsubmitDialogOpen(false);
            setApplicationToUnsubmit(null);
            refetch(); // This should refresh the list and move the application to the Draft tab
         } catch (error) {
            console.error('Error unsubmitting application:', error);
            toast.error(`Error unsubmitting application: ${error.message || 'Unknown error occurred'}`);
         }
      }
   };

   const handleSubmitClick = (application) => {
      setApplicationToSubmit(application);
      setSubmitDialogOpen(true);
   };

   const handleSubmitConfirm = async () => {
      if (applicationToSubmit) {
         try {
            await submitPermit(applicationToSubmit.id);
            toast.success('Application submitted successfully');
            setSubmitDialogOpen(false);
            setApplicationToSubmit(null);
            refetch();
         } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(`Error submitting application: ${error.message || 'Unknown error occurred'}`);
         }
      }
   };

   const handleResubmitClick = (application) => {
      setApplicationToResubmit(application);
      setResubmitDialogOpen(true);
   };

   const handleResubmitConfirm = async () => {
      if (applicationToResubmit) {
         try {
            await resubmitPermit(applicationToResubmit.id);
            toast.success('Application resubmitted successfully');
            setResubmitDialogOpen(false);
            setApplicationToResubmit(null);
            refetch();
         } catch (error) {
            console.error('Error resubmitting application:', error);
            toast.error(`Error resubmitting application: ${error.message || 'Unknown error occurred'}`);
         }
      }
   };

   const userId = getUserId();

   // Add OOPs data fetching
   const {
      oops,
      loading: oopsLoading,
      error: oopsError,
      refetch: refetchOOPs
   } = useUserOrderOfPayments(
      userId,
      activeMainTab === 'Order Of Payments' ? activeSubTab : null
   );

   const renderOrderOfPaymentsTable = () => {
      if (oopsLoading) return <p className="text-center text-gray-500">Loading order of payments...</p>;
      if (oopsError) return <p className="text-center text-red-500">Error loading order of payments</p>;

      const filteredOOPs = oops.filter(oop =>
         oop.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
         oop.applicationId.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredOOPs.length === 0) {
         return <p className="text-center text-gray-500">No order of payments found</p>;
      }

      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Number
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Number
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
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
                  {filteredOOPs.map((oop) => (
                     <UserOOPRow
                        key={oop._id}
                        oop={oop}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderTable = () => {
      if (activeMainTab === 'Order Of Payments') {
         return renderOrderOfPaymentsTable();
      }
      if (loading) return <p className="text-center text-gray-500">Loading...</p>;
      if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;
      if (filteredApplications.length === 0) {
         return <p className="text-center text-gray-500">No applications found.</p>;
      }

      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        APPLICATION NUMBER
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        APPLICATION TYPE
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATE SUBMITTED
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                     <UserApplicationRow
                        key={app.id}
                        app={app}
                        onEdit={handleEditApplication}
                        onDelete={handleDeleteClick}
                        onUnsubmit={handleUnsubmitClick}
                        onSubmit={handleSubmitClick}
                        onResubmit={handleResubmitClick}
                        getStatusColor={getStatusColor}
                        fetchCOVPermit={fetchCOVPermit}
                        fetchCSAWPermit={fetchCSAWPermit}
                        fetchPLTCPPermit={fetchPLTCPPermit}
                        fetchPTPRPermit={fetchPTPRPermit}
                        fetchPLTPPermit={fetchPLTPPermit}
                        fetchTCEBPPermit={fetchTCEBPPermit}
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
               <h1 className="text-3xl font-bold text-green-800">My Applications</h1>
               <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {mainTabs.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => {
                           setActiveMainTab(tab);
                           setActiveSubTab(subTabs[tab][0]);
                        }}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeMainTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {subTabs[activeMainTab].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeSubTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>
            <div className="mb-6">
               <Input
                  type="text"
                  placeholder={`Search ${activeMainTab.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>
            {renderTable()}
         </div>
         <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                     Are you sure you want to delete this draft application? This action cannot be undone.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                     Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm}>
                     Delete
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
         <AlertDialog open={unsubmitDialogOpen} onOpenChange={setUnsubmitDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Unsubmit</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to unsubmit this application? It will be moved back to Draft status.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnsubmitConfirm}>Unsubmit</AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
         <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to submit this application? You won't be able to edit it after submission.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmitConfirm}>Submit</AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
         <Dialog open={resubmitDialogOpen} onOpenChange={setResubmitDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Confirm Resubmission</DialogTitle>
                  <DialogDescription>
                     Are you sure you want to resubmit this application? It will be moved back to Returned status.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setResubmitDialogOpen(false)}>
                     Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleResubmitConfirm}>
                     Resubmit
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
};

export default UserApplicationsStatusPage;
