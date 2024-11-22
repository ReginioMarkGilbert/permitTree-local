import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, FileX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import RRC_ApplicationRow from './RRC_ApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import ApplicationFilters from '../../../../../components/DashboardFilters/ApplicationFilters';
import { useTypewriter } from '@/hooks/useTypewriter';

const ReceivingReleasingClerkDashboard = () => {
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Applications For Review');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   const mainTabs = ['Applications', 'Certificates'];
   const subTabs = {
      'Applications': ['Applications For Review', 'Returned Applications', 'Accepted Applications', 'Applications For Recording', 'Reviewed/Recorded Applications'],
      'Certificates': ['Pending Release', 'Released Certificates']
   };

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

   const { applications, loading: appLoading, error: appError, refetch: refetchApps } = useApplications(getQueryParamsForTab(activeSubTab));

   const handleRefetch = () => {
      refetchApps();
   };

   useEffect(() => {
      refetchApps();
   }, [refetchApps, activeSubTab]);

   // Add polling for automatic updates
   useEffect(() => {
      const pollInterval = setInterval(handleRefetch, 5000); // Poll every 5 seconds
      return () => clearInterval(pollInterval);
   }, [activeMainTab]);

   const handleTabChange = (tab) => {
      const isCurrentlyCertificates = activeMainTab.includes('Certificates');
      const isTargetCertificates = tab.includes('Certificates');

      setActiveMainTab(tab);
      setActiveSubTab(subTabs[tab][0]);

      // Only reset filters when switching to or from Certificates tab
      if (isCurrentlyCertificates !== isTargetCertificates) {
         setFilters({
            searchTerm: '',
            applicationType: '',
            dateRange: { from: undefined, to: undefined }
         });
      }

      handleRefetch();
   };

   const handleSubTabChange = (tab) => {
      setActiveSubTab(tab);
      handleRefetch();
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

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending': return 'bg-yellow-100 text-yellow-800';
         case 'recorded': return 'bg-blue-100 text-blue-800';
         case 'pending release': return 'bg-orange-100 text-orange-800';
         case 'released': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const isMobile = useMediaQuery('(max-width: 640px)');

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
                  onChange={(e) => handleTabChange(e.target.value)}
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
      if (appLoading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (appError) return <p className="text-center text-red-500">Error loading applications</p>;
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
                  <RRC_ApplicationRow
                     key={app.id}
                     app={app}
                     onRecordComplete={handleRefetch}
                     getStatusColor={getStatusColor}
                     currentTab={activeSubTab}
                     isMobile={true}
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
                     <RRC_ApplicationRow
                        key={app.id}
                        app={app}
                        onRecordComplete={handleRefetch}
                        getStatusColor={getStatusColor}
                        currentTab={activeSubTab}
                        isMobile={false}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderTabDescription = () => {
      const descriptions = {
         // Applications
         'Applications For Review': 'This is the list of applications pending initial review and encoding.',
         'Returned Applications': 'This is the list of applications that were returned due to incomplete requirements.',
         'Accepted Applications': 'This is the list of applications that have been accepted and encoded.',
         'Applications For Recording': 'This is the list of applications pending for recording in the logbook.',
         'Reviewed/Recorded Applications': 'This is the list of applications that have been recorded in the logbook.',

         // Certificates
         'Pending Release': 'This is the list of permits/certificates ready for release to applicants.',
         'Released Certificates': 'This is the list of permits/certificates that have been released to applicants.'
      };

      const text = useTypewriter(descriptions[activeSubTab] || '');

      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800 min-h-[20px]">{text}</h1>
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
                  {/* Description */}
                  <div className="pt-2 text-sm text-gray-600">
                     {renderTabDescription()}
                  </div>
                  <ApplicationFilters filters={filters} setFilters={setFilters} />
               </div>
            </div>

            {renderContent()}
         </div>
      </div>
   );
};

export default ReceivingReleasingClerkDashboard;
