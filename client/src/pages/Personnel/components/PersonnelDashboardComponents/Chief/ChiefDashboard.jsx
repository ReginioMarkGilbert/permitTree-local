import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChiefApplicationRow from './ChiefApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';
import ChiefOOPRow from './ChiefOOPRow';

const ChiefDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Applications for Review');

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

         default:
            return { currentStage: 'ChiefRPSReview' };
      }
   };

   const { applications, loading, error, refetch } = useApplications(getQueryParamsForTab(activeSubTab));

   const mainTabs = ['Applications', 'Applications Awaiting OOP', 'Order Of Payment', 'Certificates'];
   const subTabs = {
      'Applications': ['Applications for Review', 'Completed Reviews'],
      'Applications Awaiting OOP': ['Awaiting OOP', 'Created OOP'],
      'Order Of Payment': ['Pending Signature', 'Signed Order Of Payment'],
      'Certificates': ['Permit Pending Signature', 'Signed Permits']
   };

   const filteredApplications = useMemo(() => {
      return applications.filter(app =>
         app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [applications, searchTerm]);

   useEffect(() => {
      refetch();
   }, [refetch, activeSubTab]);

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending signature': return 'bg-orange-100 text-orange-800';
         case 'For Approval': return 'bg-purple-100 text-purple-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const handleReviewComplete = () => {
      refetch();
   };

   const renderTabDescription = () => {
      if (activeSubTab === 'Applications for Review') {
         return <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800">This is the list of applications pending for your review.</h1>
         </div>;
      }
      if (activeSubTab === 'Completed Reviews') {
         return <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800">This is the list of applications that you have reviewed.</h1>
         </div>;
      }
   }

   const {
      oops,
      oopsLoading,
      oopsError,
      refetch: refetchOOPs
   } = useOrderOfPayments();

   const renderOrderOfPaymentTable = () => {
      if (oopsLoading) return <p className="text-center text-gray-500">Loading order of payments...</p>;
      if (oopsError) {
         console.error('Error fetching OOPs:', oopsError);
         return <p className="text-center text-red-500">Error loading order of payments. Please try again later.</p>;
      }
      //  render based on active subtab
      const filteredOOPs = oops.filter(oop => {
         switch (activeSubTab) {
            case 'Pending Signature':
               return oop.OOPstatus === 'Pending Signature';
            case 'Signed Order Of Payment':
               return oop.OOPSignedByTwoSignatories === true;
            default:
               return true;
         }
      }).filter(oop =>
         oop.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         oop.billNo.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredOOPs.length === 0) {
         return <p className="text-center text-gray-500">No order of payments found.</p>;
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
                        onRefetch={refetchOOPs}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   useEffect(() => {
      if (activeMainTab === 'Order Of Payment') {
         refetchOOPs();
      } else {
         refetch();
      }
   }, [activeMainTab, activeSubTab, refetch, refetchOOPs]);

   const handleRefresh = () => {
      if (activeMainTab === 'Order Of Payment') {
         refetchOOPs();
      } else {
         refetch();
      }
   };

   const renderTable = () => {
      if (activeMainTab === 'Order Of Payment') {
         return renderOrderOfPaymentTable();
      }
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
                     <ChiefApplicationRow
                        key={app.id}
                        app={app}
                        onReviewComplete={handleReviewComplete}
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
                  <h1 className="text-2xl font-semibold text-gray-900">Chief RPS/TSD Dashboard</h1>
                  <Button onClick={handleRefresh} variant="outline">
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

            {/* Sub Tabs and Search Section */}
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

                  {renderTabDescription()}

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-1/3">
                     <Input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                     />
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
               </div>
            </div>

            {renderTable()}
         </div>
      </div>
   );
};

export default ChiefDashboard;
