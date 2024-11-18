import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplicationRow from './PCOApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import { toast } from 'sonner';
import { gql } from '@apollo/client';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

const PENRCENROfficerDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Applications for Review');
   const isMobile = useMediaQuery('(max-width: 640px)');

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Applications for Review':
            return { currentStage: 'CENRPENRReview' };
         case 'Accepted Applications':
            return { acceptedByPENRCENROfficer: true };
         case 'Awaiting OOP':
            return { awaitingOOP: true };
         case 'Created OOP':
            return { awaitingOOP: false, OOPCreated: true, status: 'In Progress' };

         case 'Pending Certification': return { currentStage: 'PENRCENRCertification' };
         case 'Certified Certificates': return { currentStage: 'PENRCENRCertified' };
         default: return {};
      }
   };

   const { applications, loading, error, refetch } = useApplications(getQueryParamsForTab(activeSubTab));

   const mainTabs = ['Applications', 'Applications Awaiting OOP', 'Certificates/Permits'];
   const subTabs = {
      'Applications': ['Applications for Review', 'Accepted Applications'],
      'Applications Awaiting OOP': ['Awaiting OOP', 'Created OOP'],
      // 'Order of Payment': ['Pending Approval', 'Approved OOP'],
      'Certificates/Permits': ['Pending Certification', 'Certified Certificates']
   };

   const filteredApplications = useMemo(() => {
      if (!applications || !Array.isArray(applications)) {
         return [];
      }

      return applications.filter(app => {
         if (!app) return false;

         const searchableFields = [
            app.applicationNumber,
            app.applicationType
         ].filter(Boolean); // Remove any undefined values

         return searchableFields.some(field =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
         );
      });
   }, [applications, searchTerm]);

   useEffect(() => {
      refetch();
   }, [refetch, activeSubTab]);

   const handleReviewComplete = () => {
      refetch();
   };

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending review': return 'bg-yellow-100 text-yellow-800';
         case 'approved': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const renderTabDescription = () => {
      if (activeSubTab === 'Applications for Review') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-[12px] text-green-800">This is the list of applications pending review to check for completeness and supporting documents.<br /><strong>After reviewing, the application will be forwarded to the Chief RPS/TSD for approval.</strong></h1>
            </div>
         );
      }
      if (activeSubTab === 'Accepted Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-[12px] text-green-800">This is the list of applications that have been accepted after review.</h1>
            </div>
         );
      }
      if (activeSubTab === 'Pending Certification') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-[12px] text-green-800">This is the list of applications pending certification.</h1>
            </div>
         );
      }
      if (activeSubTab === 'Certified Certificates') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-[12px] text-green-800">This is the list of certificates that have been certified.</h1>
            </div>
         );
      }
   };

   const renderMobileTabSelectors = () => (
      <div className="space-y-4">
         <Select
            value={activeMainTab}
            onValueChange={(value) => {
               setActiveMainTab(value);
               setActiveSubTab(subTabs[value][0]);
            }}
         >
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Select main tab" />
            </SelectTrigger>
            <SelectContent>
               {mainTabs.map((tab) => (
                  <SelectItem key={tab} value={tab}>
                     {tab}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>

         <Select
            value={activeSubTab}
            onValueChange={setActiveSubTab}
         >
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Select sub tab" />
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

   const renderTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (error) {
         console.error('Error fetching applications:', error);
         return <p className="text-center text-red-500">Error loading applications. Please try again later.</p>;
      }
      if (filteredApplications.length === 0) {
         return <p className="text-center text-gray-500">No applications found.</p>;
      }

      // Mobile view
      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredApplications.map((app) => (
                  <ApplicationRow
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
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Number</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                     <ApplicationRow
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

   const handleRefresh = () => {
      refetch();
   };

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">PENR/CENR Officer Dashboard</h1>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </div>

               {/* Tabs Section */}
               {isMobile ? renderMobileTabSelectors() : (
                  <>
                     {/* Main Tabs */}
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
                     {/* Subtabs */}
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
                  </>
               )}

               {/* Description */}
               <div className="mt-6 text-sm text-gray-600">
                  {renderTabDescription()}
               </div>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
               <div className="space-y-4">
                  <Input
                     type="text"
                     placeholder="Search applications..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="border rounded-md p-2 w-full"
                  />
               </div>
            </div>

            {/* Table Section */}
            <div className="mt-6">
               {renderTable()}
            </div>
         </div>
      </div>
   );
};

export default PENRCENROfficerDashboard;
