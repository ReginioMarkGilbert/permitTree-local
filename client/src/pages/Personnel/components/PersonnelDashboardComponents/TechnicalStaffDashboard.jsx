import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplicationRow from '../ApplicationRow';
import { useApplications } from '../../hooks/useApplications';

const TechnicalStaffDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('Pending Reviews');

   const getStatusForTab = (tab) => {
      switch (tab) {
         case 'Pending Reviews': return 'Submitted';
         case 'Returned Applications': return 'Returned';
         case 'Accepted Applications': return 'Accepted';
         case 'For Inspection and Approval': return 'ForInspectionAndApproval';
         case 'Approved Applications': return 'Approved';
         default: return 'Submitted';
      }
   };

   const { applications, loading, error, fetchApplications } = useApplications(getStatusForTab(activeTab));

   const tabs = ['Pending Reviews', 'Returned Applications', 'Accepted Applications', 'For Inspection and Approval', 'Approved Applications'];

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

   useEffect(() => {
      fetchApplications();
   }, [fetchApplications, activeTab]);

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'submitted': return 'bg-yellow-100 text-yellow-800';
         case 'returned': return 'bg-orange-100 text-orange-800';
         case 'accepted': return 'bg-green-100 text-green-800';
         case 'for inspection and approval': return 'bg-blue-100 text-blue-800';
         case 'approved': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const renderTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;
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
                        key={app.id}
                        app={app}
                        onView={() => { }} // Implement these functions
                        onPrint={() => { }}
                        onReview={() => { }}
                        getStatusColor={getStatusColor}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderTabDescription = () => {
      if (activeTab === 'Pending Reviews') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications pending review to check for completeness and supporting documents.</h1>
            </div>
         );
      }
      if (activeTab === 'Returned Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that were returned due to incomplete documents or other issues.</h1>
            </div>
         );
      }
      if (activeTab === 'Accepted Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that have been accepted after review.</h1>
            </div>
         );
      }
      if (activeTab === 'For Inspection and Approval') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications (forwarded by the Chief RPS after review) that are pending inspection (e.g., chainsaws, etc.).</h1>
            </div>
         );
      }
      if (activeTab === 'Approved Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that have been approved for authenticity after inspection.</h1>
            </div>
         );
      }
   }

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">Technical Staff Dashboard</h1>
               <Button onClick={fetchApplications} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>
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
            {renderTabDescription()}
            <div className="mb-6">
               <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>
            {renderTable()}
         </div>
      </div>
   );
};

export default TechnicalStaffDashboard;
