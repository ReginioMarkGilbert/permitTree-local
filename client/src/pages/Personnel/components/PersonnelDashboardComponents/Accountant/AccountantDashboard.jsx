// Accountant and OOP Staff Incharge Dashboard

import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';
import AccountantOOPRow from './AccountantOOPRow';
import AccountantApplicationRow from './AccountantApplicationRow';
import AccountantFilters from './AccountantFilters';

const AccountantDashboard = () => {
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      amountRange: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });
   const [activeMainTab, setActiveMainTab] = useState('Order Of Payment');
   const [activeSubTab, setActiveSubTab] = useState('Pending Approval');

   const mainTabs = ['Order Of Payment', 'Applications awaiting OOP'];
   const subTabs = {
      'Order Of Payment': ['Pending Approval', 'Approved OOP'],
      'Applications awaiting OOP': ['Awaiting OOP', 'Created OOP']
   };

   const {
      oops,
      oopsLoading,
      oopsError,
      refetch: refetchOOPs
   } = useOrderOfPayments();

   const handleReviewComplete = () => {
      refetchOOPs();
   };

   const filteredOOPs = useMemo(() => {
      return oops.filter(oop => {
         // First filter by status based on activeSubTab
         const matchesStatus = (() => {
            if (activeSubTab === 'Pending Approval') {
               return oop.OOPstatus === 'For Approval';
            } else if (activeSubTab === 'Approved OOP') {
               return oop.OOPstatus === 'Awaiting Payment' || oop.OOPstatus === 'Payment Proof Approved' || oop.OOPstatus === 'Completed OOP' || oop.OOPstatus === 'Issued OR';
            }
            return true;
         })();

         // Then apply the rest of the filters
         const matchesSearch = oop.applicationId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            oop.billNo.toLowerCase().includes(filters.searchTerm.toLowerCase());

         const matchesType = !filters.applicationType ||
            filters.applicationType === "all" ||
            oop.applicationType === filters.applicationType;

         const matchesAmount = (() => {
            if (!filters.amountRange || filters.amountRange === "all") return true;
            const amount = parseFloat(oop.amount);
            switch (filters.amountRange) {
               case "0-1000": return amount <= 1000;
               case "1001-5000": return amount > 1000 && amount <= 5000;
               case "5001-10000": return amount > 5000 && amount <= 10000;
               case "10001+": return amount > 10000;
               default: return true;
            }
         })();

         const matchesDateRange = (() => {
            if (!filters.dateRange.from && !filters.dateRange.to) return true;
            const oopDate = new Date(oop.dateCreated);
            oopDate.setHours(0, 0, 0, 0);
            const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
            const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(0, 0, 0, 0);
            return (!fromDate || oopDate >= fromDate) && (!toDate || oopDate <= toDate);
         })();

         return matchesStatus && matchesSearch && matchesType && matchesAmount && matchesDateRange;
      });
   }, [oops, filters, activeSubTab]);

   const renderOrderOfPaymentTable = () => {
      if (oopsLoading) return <p className="text-center text-gray-500">Loading order of payments...</p>;
      if (oopsError) {
         console.error('Error fetching OOPs:', oopsError);
         return <p className="text-center text-red-500">Error loading order of payments. Please try again later.</p>;
      }

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
                     <AccountantOOPRow
                        key={oop._id}
                        oop={oop}
                        onReviewComplete={handleReviewComplete}
                        currentTab={activeSubTab}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderApplicationTable = () => {
      // Implement logic to fetch and render applications awaiting OOP
      // Similar to renderOrderOfPaymentTable
   };

   const renderFilters = () => {
      return <AccountantFilters
         filters={filters}
         setFilters={setFilters}
         activeMainTab={activeMainTab}
      />;
   };

   return (
      <div className="bg-green-50 min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Accountant Dashboard</h1>
                  <Button onClick={refetchOOPs} variant="outline">
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
               </div>
            </div>

            {/* Content Section */}
            {activeMainTab === 'Order Of Payment' ? renderOrderOfPaymentTable() : renderApplicationTable()}
         </div>
      </div>
   );
};

export default AccountantDashboard;
