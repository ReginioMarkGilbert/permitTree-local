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

   const {
      applications,
      loading,
      error,
      refetch,
      deletePermit,
      updateCSAWPermit,
      updateCOVPermit,
      updatePLTPPermit,
      updatePTPRPermit,
      fetchCOVPermit,
      fetchCSAWPermit,
      fetchPLTPPermit,
      fetchPTPRPermit,
      unsubmitPermit,
      submitPermit,
   } = useUserApplications(activeSubTab);

   const mainTabs = ['Applications', 'Order Of Payments'];
   const subTabs = {
      'Applications': ['Draft', 'Submitted', 'Returned', 'Accepted', 'Released', 'Expired', 'Rejected'],
      'Order Of Payments': ['Awaiting Payment', 'Payment Proof Submitted', 'Returned', 'Approved', 'Completed']
   };

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

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

   useEffect(() => {
      // console.log('Applications data changed:', applications);
   }, [applications]);

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

         switch (editedData.applicationType) {
            case 'Certificate of Verification':
               await updateCOVPermit(id, editedData);
               break;
            case 'Chainsaw Registration':
               await updateCSAWPermit(id, editedData);
               break;
            case 'Public Land Timber Permit':
               await updatePLTPPermit(id, editedData);
               break;
            case 'Private Tree Plantation Registration':
               await updatePTPRPermit(id, editedData);
               break;
            default:
               console.error('Unsupported application type:', editedData.applicationType);
               throw new Error(`Unsupported application type: ${editedData.applicationType}`);
         }

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

   const renderTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading...</p>;
      if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;
      if (applications.length === 0) {
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
                        getStatusColor={getStatusColor}
                        fetchCOVPermit={fetchCOVPermit}
                        fetchCSAWPermit={fetchCSAWPermit}
                        fetchPLTPPermit={fetchPLTPPermit}
                        fetchPTPRPermit={fetchPTPRPermit}
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
      </div>
   );
};

export default UserApplicationsStatusPage;
