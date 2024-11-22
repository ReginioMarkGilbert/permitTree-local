import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, FileX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ChiefApplicationRow from './ChiefApplicationRow';
import ChiefOOPRow from './ChiefOOPRow';
import { useApplications } from '@/hooks/useApplications';
import { useOrderOfPayments } from '@/hooks/useOrderOfPayments';
import ApplicationFilters from '@/components/DashboardFilters/ApplicationFilters';
import OOPFilters from '@/components/DashboardFilters/OOPFilters';
import { useTypewriter } from '@/hooks/useTypewriter';

const ChiefDashboard = () => {
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Applications for Review');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   const mainTabs = ['Applications', 'Applications Awaiting OOP', 'Order Of Payment', 'Applications Inspection Reports', 'Certificates'];
   const subTabs = {
      'Applications': ['Applications for Review', 'Completed Reviews'],
      'Applications Inspection Reports': ['Reports for Review', 'Reviewed Reports'],
      'Applications Awaiting OOP': ['Awaiting OOP', 'Created OOP'],
      'Order Of Payment': ['Pending Signature', 'Signed Order Of Payment'],
      'Certificates': ['Permit Pending Signature', 'Signed Permits']
   };

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Applications for Review':
            return { currentStage: 'ChiefRPSReview', reviewedByChief: false };
         case 'Completed Reviews':
            return { reviewedByChief: true };

         case 'Awaiting OOP':
            return { awaitingOOP: true };
         case 'Created OOP':
            return { OOPCreated: true, awaitingOOP: false };

         case 'Reports for Review':
            return { currentStage: 'InspectionReportForReviewByChief', hasInspectionReport: true };
         case 'Reviewed Reports':
            return { InspectionReportsReviewedByChief: true };

         case 'Pending Signature':
            return { OOPstatus: 'For Approval' };
         case 'Signed Order Of Payment':
            return { OOPSignedByTwoSignatories: true };

         default:
            return { currentStage: 'ChiefRPSReview' };
      }
   };

   const { applications, loading: appLoading, error: appError, refetch: refetchApps } = useApplications(getQueryParamsForTab(activeSubTab));
   const { oops, loading: oopsLoading, error: oopsError, refetch: refetchOOPs } = useOrderOfPayments();

   const handleRefetch = () => {
      if (activeMainTab === 'Order Of Payment') {
         refetchOOPs();
      } else {
         refetchApps();
      }
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

   const handleReviewComplete = () => {
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

   const filteredOOPs = useMemo(() => {
      return oops.filter(oop => {
         const matchesStatus = (() => {
            if (activeSubTab === 'Pending Signature') {
               return oop.OOPstatus === 'Pending Signature';
            } else if (activeSubTab === 'Signed Order Of Payment') {
               return oop.OOPSignedByTwoSignatories === true;
            }
            return true;
         })();

         const matchesSearch = oop.billNo?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            oop.applicationId?.toLowerCase().includes(filters.searchTerm.toLowerCase());

         const matchesType = !filters.applicationType ||
            filters.applicationType === "all" ||
            oop.natureOfApplication === filters.applicationType;

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

         const matchesDateRange = (() => {
            if (!filters.dateRange.from && !filters.dateRange.to) return true;
            const oopDate = new Date(parseInt(oop.createdAt));
            if (isNaN(oopDate.getTime())) return true;
            oopDate.setHours(0, 0, 0, 0);
            const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
            const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(0, 0, 0, 0);
            return (!fromDate || oopDate >= fromDate) && (!toDate || oopDate <= toDate);
         })();

         return matchesStatus && matchesSearch && matchesType && matchesAmount && matchesDateRange;
      });
   }, [oops, activeSubTab, filters]);

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending signature': return 'bg-orange-100 text-orange-800';
         case 'For Approval': return 'bg-purple-100 text-purple-800';
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

   const renderFilters = () => {
      return activeMainTab === 'Order Of Payment' ? (
         <OOPFilters filters={filters} setFilters={setFilters} />
      ) : (
         <ApplicationFilters filters={filters} setFilters={setFilters} />
      );
   };

   const renderContent = () => {
      if (activeMainTab === 'Order Of Payment') {
         return renderOOPTable();
      }
      return renderApplicationTable();
   };

   const renderOOPTable = () => {
      if (oopsLoading) return <p className="text-center text-gray-500">Loading order of payments...</p>;
      if (oopsError) return <p className="text-center text-red-500">Error loading order of payments</p>;
      if (filteredOOPs.length === 0) {
         return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
               <FileX className="mx-auto h-12 w-12 text-gray-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No orders of payment found</h3>
               <p className="mt-1 text-sm text-gray-500">
                  {filters.applicationType ?
                     `No orders of payment found for ${filters.applicationType}` :
                     'No orders of payment available'}
               </p>
            </div>
         );
      }

      // Mobile view
      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredOOPs.map((oop) => (
                  <ChiefOOPRow
                     key={oop._id}
                     oop={oop}
                     onRefetch={handleRefetch}
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
                        Bill Number
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
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
                     <ChiefOOPRow
                        key={oop._id}
                        oop={oop}
                        onRefetch={handleRefetch}
                        isMobile={false}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderApplicationTable = () => {
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
                  <ChiefApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleReviewComplete}
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
                     <ChiefApplicationRow
                        key={app.id}
                        app={app}
                        onReviewComplete={handleReviewComplete}
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
         'Applications for Review': 'This is the list of applications pending for your review.',
         'Completed Reviews': 'This is the list of applications that you have reviewed.',

         // Applications Inspection Reports
         'Reports for Review': 'This is the list of inspection reports that require your review and approval.',
         'Reviewed Reports': 'This is the list of inspection reports that you have already reviewed.',

         // Applications Awaiting OOP
         'Awaiting OOP': 'This is the list of applications waiting for Order of Payment creation.',
         'Created OOP': 'This is the list of applications with created Order of Payments.',

         // Order Of Payment
         'Pending Signature': 'This is the list of Order of Payments pending for your signature.',
         'Signed Order Of Payment': 'This is the list of Order of Payments that you have signed.',

         // Certificates
         'Permit Pending Signature': 'This is the list of permits and certificates waiting for your signature.',
         'Signed Permits': 'This is the list of permits and certificates that you have signed.'
      };

      const text = useTypewriter(descriptions[activeSubTab] || '');

      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800">{text}</h1>
         </div>
      );
   };

   return (
      <div className="bg-green-50 min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Chief RPS/TSD Dashboard</h1>
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
                  {renderFilters()}
               </div>
            </div>

            {renderContent()}
         </div>
      </div>
   );
};

export default ChiefDashboard;
