import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RRC_ApplicationRow from './RRC_ApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import RRCApplicationFilters from './RRCApplicationFilters';

const ReceivingReleasingClerkDashboard = () => {
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });
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
            return { currentStage: 'ForRecordByReceivingClerk', recordedByReceivingClerk: false };
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

   const { applications, loading, error, refetch } = useApplications(getQueryParamsForTab(activeSubTab));

   const mainTabs = ['Applications', 'Certificates'];
   const subTabs = {
      'Applications': ['Applications For Review', 'Returned Applications', 'Accepted Applications', 'Applications For Recording', 'Reviewed/Recorded Applications'],
      'Certificates': ['Pending Release', 'Released Certificates']
   };

   const filteredApplications = useMemo(() => {
      return applications.filter(app => {
         const matchesSearch = app.applicationNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            app.applicationType.toLowerCase().includes(filters.searchTerm.toLowerCase());

         const matchesType = !filters.applicationType ||
            filters.applicationType === "all" ||
            app.applicationType === filters.applicationType;

         const matchesDateRange = (() => {
            if (!filters.dateRange.from && !filters.dateRange.to) return true;

            const appDate = new Date(app.dateOfSubmission);
            appDate.setHours(0, 0, 0, 0);

            const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
            const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(0, 0, 0, 0);

            return (!fromDate || appDate >= fromDate) && (!toDate || appDate <= toDate);
         })();

         return matchesSearch && matchesType && matchesDateRange;
      });
   }, [applications, filters]);

   useEffect(() => {
      refetch();
   }, [refetch, activeSubTab]);

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
      refetch();
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

   const renderFilters = () => {
      return <RRCApplicationFilters filters={filters} setFilters={setFilters} />;
   };

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
                        currentTab={activeSubTab}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   return (
      <div className="bg-green-50 min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Receiving/Releasing Clerk Dashboard</h1>
                  <Button onClick={refetch} variant="outline">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     Refresh
                  </Button>
               </div>

               {/* Main Tabs */}
               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                     {mainTabs.map((tab) => (
                        <button
                           key={tab}
                           onClick={() => {
                              setActiveMainTab(tab);
                              setActiveSubTab(subTabs[tab][0]);
                           }}
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
            </div>

            {/* Sub Tabs and Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="space-y-4">
                  {/* Sub Tabs */}
                  <div className="bg-gray-100 p-1 rounded-md inline-flex flex-wrap gap-1">
                     {subTabs[activeMainTab].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveSubTab(tab)}
                           className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                              ${activeSubTab === tab
                                 ? 'bg-white text-green-800 shadow'
                                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>

                  {renderFilters()}

                  {renderTabDescription()}
                  <div className="mb-6">
                     <Input
                        type="text"
                        placeholder="Search applications..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="border rounded-md p-2 w-full"
                     />
                  </div>
                  {renderTable()}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ReceivingReleasingClerkDashboard;
