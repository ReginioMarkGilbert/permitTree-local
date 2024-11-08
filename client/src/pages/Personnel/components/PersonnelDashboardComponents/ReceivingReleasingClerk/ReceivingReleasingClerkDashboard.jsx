import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RRC_ApplicationRow from './RRC_ApplicationRow';
import { useApplications } from '../../../hooks/useApplications';

const ReceivingReleasingClerkDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Applications For Review'); // set default tab

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Applications For Review':
            return { currentStage: 'ReceivingClerkReview' };
         case 'Returned Applications':
            return { currentStage: 'ReturnedByReceivingClerk' };
         case 'Accepted Applications':
            return { acceptedByReceivingClerk: true };
         case 'Applications For Recording':
            return { currentStage: 'ForRecordByReceivingClerk' };
         case 'Reviewed/Recorded Applications':
            return { recordedByReceivingClerk: true };
         case 'Pending Release':
            return { status: 'Approved', currentStage: 'PendingRelease' };
         case 'Released Certificates':
            return { status: 'Released' };
         default:
            return { currentStage: 'ForRecordByReceivingClerk' };
      }
   };

   const { applications, loading, error, fetchApplications } = useApplications(getQueryParamsForTab(activeSubTab));

   const mainTabs = ['Applications', 'Certificates'];
   const subTabs = {
      'Applications': ['Applications For Review', 'Returned Applications', 'Accepted Applications', 'Applications For Recording', 'Reviewed/Recorded Applications'],
      'Certificates': ['Pending Release', 'Released Certificates']
   };

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

   useEffect(() => {
      fetchApplications();
   }, [fetchApplications, activeSubTab]);

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending': return 'bg-yellow-100 text-yellow-800';
         case 'recorded': return 'bg-blue-100 text-blue-800';
         case 'pending release': return 'bg-orange-100 text-orange-800';
         case 'released': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }

   };

   const handleRecordComplete = () => {
      fetchApplications();
   };

   const renderTabDescription = () => {
      if (activeSubTab === 'Pending Applications') {
         return <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800">This is the list of applications pending for recording.</h1>
         </div>;
      }
      if (activeSubTab === 'Recorded Applications') {
         return <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800">This is the list of applications that have been recorded.</h1>
         </div>;
      }
   }

   const renderTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (error) {
         console.error('Error fetching applications:', error);
         return <p className="text-center text-red-500">Error loading applications. Please try again later.</p>;
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
                     <RRC_ApplicationRow
                        key={app.id}
                        app={app}
                        onRecordComplete={handleRecordComplete}
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
               <h1 className="text-3xl font-bold text-green-800">Receiving/Releasing Clerk Dashboard</h1>
               <Button onClick={fetchApplications} variant="outline">
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

export default ReceivingReleasingClerkDashboard;
