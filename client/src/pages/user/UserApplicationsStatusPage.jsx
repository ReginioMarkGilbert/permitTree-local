import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserApplicationRow from './components/UserApplicationRow';
import { useUserApplications } from './hooks/useUserApplications';
import { toast } from 'react-toastify';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";

const UserApplicationsStatusPage = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Draft');
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [applicationToDelete, setApplicationToDelete] = useState(null);

   const { applications, loading, error, refetch, deletePermit } = useUserApplications(activeSubTab);

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

   const handleDeleteClick = (application) => {
      setApplicationToDelete(application);
      setDeleteDialogOpen(true);
   };

   const handleDeleteConfirm = async () => {
      if (applicationToDelete) {
         try {
            await deletePermit(applicationToDelete.id);
            toast.success('Draft deleted successfully');
            setDeleteDialogOpen(false);
            setApplicationToDelete(null);
         } catch (error) {
            console.error('Error deleting draft:', error);
            toast.error(`Error deleting draft: ${error.message || 'Unknown error occurred'}`);
         }
      }
   };

   useEffect(() => {
      refetch({ status: activeSubTab });
   }, [activeSubTab, refetch]);

   const handleEdit = async (id, editedData) => {
      try {
         // Implement the edit functionality here
         // You might need to create a new mutation for editing applications
         // await editPermit({ variables: { id, input: editedData } });
         toast.success('Application updated successfully');
         refetch();
      } catch (error) {
         console.error('Error updating application:', error);
         toast.error(`Error updating application: ${error.message || 'Unknown error occurred'}`);
      }
   };

   const renderTable = () => {
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
                  {filteredApplications.map((app) => (
                     <UserApplicationRow
                        key={app.id}
                        app={app}
                        onView={() => { }} // Implement these functions
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
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
      </div>
   );
};

export default UserApplicationsStatusPage;
