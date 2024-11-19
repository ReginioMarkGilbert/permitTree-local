import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getUserId } from '@/utils/auth';
import { gql } from 'graphql-tag';
import { FileX, RefreshCw } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ApplicationFilters from '../../components/DashboardFilters/ApplicationFilters';
import OOPFilters from '../../components/DashboardFilters/OOPFilters';
import UserApplicationRow from './components/UserApplicationRow';
import UserOOPRow from './components/UserOOPRow';
import { useUserApplications } from './hooks/useUserApplications';
import { useUserOrderOfPayments } from './hooks/useUserOrderOfPayments';

const GET_OOP_DETAILS = gql`
  query GetOOPDetails($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      applicationNumber
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
   const [filters, setFilters] = useState({
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   const isMobile = useMediaQuery('(max-width: 640px)');

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         // Applications
         case 'Draft': return { status: 'Draft' };
         case 'Submitted': return { status: 'Submitted' };
         case 'In Progress': return { status: 'In Progress' };
         case 'Returned': return { status: 'Returned', currentStage: 'ReturnedByTechnicalStaff' };
         case 'Accepted': return { status: 'Accepted' };
         case 'Released': return { status: 'Released' };
         case 'Expired': return { status: 'Expired' };
         case 'Rejected': return { status: 'Rejected' };
         // Order of Payments - Map to backend statuses
         case 'Awaiting Payment': return { OOPstatus: 'Awaiting Payment' };
         case 'Payment Proof Submitted': return { OOPstatus: 'Payment Proof Submitted' };
         case 'Payment Proof Rejected': return { OOPstatus: 'Payment Proof Rejected' };
         case 'Payment Proof Approved': return { OOPstatus: 'Payment Proof Approved' };
         case 'Issued OR': return { OOPstatus: 'Issued OR' };
         case 'Completed': return { OOPstatus: 'Completed OOP' };
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
      'Applications': ['Draft', 'Submitted', 'In Progress', 'Returned', 'Accepted', 'Released', 'Expired', 'Rejected'],
      'Order Of Payments': ['Awaiting Payment', 'Payment Proof Submitted', 'Payment Proof Rejected', 'Payment Proof Approved', 'Completed', 'Issued OR'],
      'Renewals': ['Draft', 'Submitted', 'Returned', 'Renewed', 'Rejected']
   };

   const filteredApplications = useMemo(() => {
      return applications.filter(app => {
         // Search term filter
         const matchesSearch = app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicationType.toLowerCase().includes(searchTerm.toLowerCase());

         // Application type filter
         const matchesType = !filters.applicationType ||
            app.applicationType === filters.applicationType;

         // Date range filter
         const appDate = new Date(app.dateOfSubmission);
         const matchesDateRange = (!filters.dateRange.from || appDate >= filters.dateRange.from) &&
            (!filters.dateRange.to || appDate <= filters.dateRange.to);

         return matchesSearch && matchesType && matchesDateRange;
      });
   }, [applications, searchTerm, filters]);

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
            case 'Private Land Timber Permit':
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

   // Combined refetch function
   const handleRefetch = async () => {
      if (activeMainTab === 'Order Of Payments') {
         await refetchOOPs();
      } else {
         await refetch();
      }
   };

   // Add polling for automatic updates
   useEffect(() => {
      const pollInterval = setInterval(handleRefetch, 5000); // Poll every 5 seconds
      return () => clearInterval(pollInterval);
   }, [activeMainTab]);

   // Update tab change handler to trigger refetch
   const handleTabChange = (tab) => {
      setActiveMainTab(tab);
      setActiveSubTab(subTabs[tab][0]);
      setFilters({
         searchTerm: '',
         applicationType: '',
         amountRange: '',
         dateRange: { from: undefined, to: undefined }
      });
      handleRefetch();
   };

   const handleSubTabChange = (tab) => {
      setActiveSubTab(tab);
      handleRefetch();
   };

   const filteredOOPs = useMemo(() => {
      return oops.filter(oop => {
         // Search term filter
         const matchesSearch =
            (oop.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (oop.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

         // Nature of Application filter
         const matchesType = !filters.applicationType ||
            filters.applicationType === "all" ||
            oop.natureOfApplication === filters.applicationType;

         // Amount range filter
         const matchesAmount = !filters.amountRange || (() => {
            const amount = parseFloat(oop.totalAmount);
            switch (filters.amountRange) {
               case '0-1000': return amount >= 0 && amount <= 1000;
               case '1001-5000': return amount > 1000 && amount <= 5000;
               case '5001-10000': return amount > 5000 && amount <= 10000;
               case '10001+': return amount > 10000;
               default: return true;
            }
         })();

         // Date range filter
         const matchesDateRange = (() => {
            if (!filters.dateRange.from && !filters.dateRange.to) return true;

            // Convert createdAt timestamp to Date object
            const oopDate = new Date(parseInt(oop.createdAt));
            if (isNaN(oopDate.getTime())) {
               console.warn('Invalid date:', oop.createdAt);
               return true;
            }

            // Set time to start of day for consistent comparison
            oopDate.setHours(0, 0, 0, 0);

            const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
            const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(0, 0, 0, 0);

            // For debugging
            console.log('OOP Date:', oopDate);
            console.log('From Date:', fromDate);
            console.log('To Date:', toDate);

            return (!fromDate || oopDate >= fromDate) && (!toDate || oopDate <= toDate);
         })();

         return matchesSearch && matchesType && matchesAmount && matchesDateRange;
      });
   }, [oops, searchTerm, filters]);

   const renderOrderOfPaymentsTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading...</p>;
      if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

      const displayOOPs = filteredOOPs;

      if (displayOOPs.length === 0) {
         return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
               <FileX className="mx-auto h-12 w-12 text-gray-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No orders of payment found</h3>
               <p className="mt-1 text-sm text-gray-500">
                  {filters.applicationType ?
                     `No orders of payment found for ${filters.applicationType}` :
                     'No orders of payment available for your applications'}
               </p>
            </div>
         );
      }

      if (isMobile) {
         return (
            <div className="space-y-4">
               {displayOOPs.map((oop) => (
                  <UserOOPRow
                     key={oop._id}
                     oop={oop}
                     onRefetch={handleRefetch}
                  />
               ))}
            </div>
         );
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
                  {displayOOPs.map((oop) => (
                     <UserOOPRow
                        key={oop._id}
                        oop={oop}
                        onRefetch={handleRefetch}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const renderMobileTabSelectors = () => {
      if (isChrome) {
         return (
            <div className="space-y-4">
               <select
                  value={activeMainTab}
                  onChange={(e) => {
                     handleTabChange(e.target.value);
                  }}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
               >
                  {mainTabs.map((tab) => (
                     <option key={tab} value={tab}>
                        {tab}
                     </option>
                  ))}
               </select>

               <select
                  value={activeSubTab}
                  onChange={(e) => handleSubTabChange(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
               >
                  {subTabs[activeMainTab].map((tab) => (
                     <option key={tab} value={tab}>
                        {tab}
                     </option>
                  ))}
               </select>
            </div>
         );
      }

      return (
         <div className="space-y-4">
            <Select value={activeMainTab} onValueChange={handleTabChange}>
               <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tab" />
               </SelectTrigger>
               <SelectContent>
                  {mainTabs.map((tab) => (
                     <SelectItem key={tab} value={tab}>
                        {tab}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Select value={activeSubTab} onValueChange={handleSubTabChange}>
               <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
               </SelectTrigger>
               <SelectContent>
                  {subTabs[activeMainTab].map((tab) => (
                     <SelectItem key={tab} value={tab}>
                        {tab}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
      );
   };

   const renderTabs = () => {
      if (isMobile) {
         return renderMobileTabSelectors();
      }

      return (
         <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
               {mainTabs.map((tab) => (
                  <button
                     key={tab}
                     onClick={() => handleTabChange(tab)}
                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${activeMainTab === tab
                           ? 'bg-white text-green-800 shadow'
                           : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>
      );
   };

   const renderContent = () => {
      if (activeMainTab === 'Order Of Payments') {
         return renderOrderOfPaymentsTable();
      }
      return renderApplicationsTable();
   };

   const renderApplicationsTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (error) return <p className="text-center text-red-500">Error loading applications</p>;
      if (filteredApplications.length === 0) {
         return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
               <FileX className="mx-auto h-12 w-12 text-gray-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
               <p className="mt-1 text-sm text-gray-500">
                  {filters.applicationType ?
                     `No applications found for ${filters.applicationType}` :
                     'No applications available'}
               </p>
            </div>
         );
      }

      // Mobile view
      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredApplications.map((app) => (
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
                     currentTab={activeSubTab}
                  />
               ))}
            </div>
         );
      }

      // Desktop view
      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Number
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Type
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                        currentTab={activeSubTab}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderFilters = () => {
      return activeMainTab === 'Order Of Payments' ? (
         <OOPFilters filters={filters} setFilters={setFilters} />
      ) : (
         <ApplicationFilters filters={filters} setFilters={setFilters} />
      );
   };

   return (
      <div className="bg-green-50 min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">My Applications</h1>
                  <Button onClick={handleRefetch} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </div>

               {/* Tabs Section */}
               {renderTabs()}
            </div>

            {/* Sub Tabs and Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="space-y-4">
                  {!isMobile && (
                     <div className="bg-gray-100 p-1 rounded-md inline-flex flex-wrap gap-1">
                        {subTabs[activeMainTab].map((tab) => (
                           <button
                              key={tab}
                              onClick={() => handleSubTabChange(tab)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                                 ${activeSubTab === tab
                                    ? 'bg-white text-green-800 shadow'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                           >
                              {tab}
                           </button>
                        ))}
                     </div>
                  )}
                  {renderFilters()}
               </div>
            </div>

            {renderContent()}
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
