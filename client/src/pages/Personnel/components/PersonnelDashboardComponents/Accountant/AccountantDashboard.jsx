// Accountant and OOP Staff Incharge Dashboard

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';
import AccountantOOPRow from './AccountantOOPRow';
import AccountantApplicationRow from './AccountantApplicationRow';

const AccountantDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
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

   const renderOrderOfPaymentTable = () => {
      if (oopsLoading) return <p className="text-center text-gray-500">Loading order of payments...</p>;
      if (oopsError) {
         console.error('Error fetching OOPs:', oopsError);
         return <p className="text-center text-red-500">Error loading order of payments. Please try again later.</p>;
      }

      const filteredOOPs = oops.filter(oop => {
         if (activeSubTab === 'Pending Approval') {
            return oop.OOPstatus === 'For Approval';
         } else if (activeSubTab === 'Approved OOP') {
            return oop.OOPstatus === 'Awaiting Payment';
         }
         return true;
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

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">Accountant Dashboard</h1>
               <Button onClick={refetchOOPs} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>

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
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeMainTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            {/* Sub Tabs */}
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {subTabs[activeMainTab].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeSubTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            <div className="mb-6">
               <Input
                  type="text"
                  placeholder="Search orders of payment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>

            {activeMainTab === 'Order Of Payment' ? renderOrderOfPaymentTable() : renderApplicationTable()}
         </div>
      </div>
   );
};

export default AccountantDashboard;
