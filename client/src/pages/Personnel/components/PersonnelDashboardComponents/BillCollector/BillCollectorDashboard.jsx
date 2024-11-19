import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';
import BillCollectorOOPRow from './BC_OOPRow';
import { RefreshCw } from 'lucide-react';
import { gql, useQuery } from '@apollo/client';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const GET_OOPS = gql`
  query GetOOPs {
    getOOPs {
      _id
      billNo
      applicationId
      applicationNumber
      namePayee
      address
      natureOfApplication
      totalAmount
      OOPstatus
      createdAt
      items {
        legalBasis
        description
        amount
      }
      paymentProof {
        transactionId
        paymentMethod
        amount
        timestamp
        referenceNumber
        payerDetails {
          name
          email
          phoneNumber
        }
        status
      }
      officialReceipt {
        orNumber
        dateIssued
        amount
        paymentMethod
        remarks
      }
    }
  }
`;

const BillCollectorDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('Payment Proof');
   const isMobile = useMediaQuery('(max-width: 640px)');
   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   // Use direct query instead of hook
   const {
      data: oopsData,
      loading: oopsLoading,
      error: oopsError,
      refetch: refetchOOPs
   } = useQuery(GET_OOPS, {
      fetchPolicy: 'network-only',
      pollInterval: 5000 // Poll every 5 seconds
   });

   const tabs = ['Awaiting Payment', 'Payment Proof', 'Completed Payments', 'Issued OR'];

   const filteredOOPs = useMemo(() => {
      const oops = oopsData?.getOOPs || [];
      return oops.filter(oop => {
         // Filter based on active tab
         if (activeTab === 'Payment Proof') {
            return oop.OOPstatus === 'Payment Proof Submitted';
         } else if (activeTab === 'Awaiting Payment') {
            return oop.OOPstatus === 'Awaiting Payment';
         } else if (activeTab === 'Completed Payments') {
            return oop.OOPstatus === 'Payment Proof Approved' || oop.OOPstatus === 'Completed OOP';
         } else if (activeTab === 'Issued OR') {
            return oop.OOPstatus === 'Issued OR';
         }
         return true;
      }).filter(oop =>
         oop.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         oop.billNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [oopsData, activeTab, searchTerm]);

   const renderMobileTabSelector = () => {
      if (isChrome) {
         return (
            <select
               value={activeTab}
               onChange={(e) => setActiveTab(e.target.value)}
               className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
               {tabs.map((tab) => (
                  <option key={tab} value={tab}>
                     {tab}
                  </option>
               ))}
            </select>
         );
      }

      return (
         <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
               {tabs.map((tab) => (
                  <SelectItem key={tab} value={tab}>
                     {tab}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   const renderTable = () => {
      if (oopsLoading) return <div className="text-center">Loading...</div>;
      if (oopsError) return <div className="text-center text-red-500">Error loading order of payments</div>;
      if (filteredOOPs.length === 0) {
         return <p className="text-center text-gray-500">No order of payments found.</p>;
      }

      // Mobile view
      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredOOPs.map((oop) => (
                  <BillCollectorOOPRow
                     key={oop._id}
                     oop={oop}
                     onReviewComplete={refetchOOPs}
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
                     <BillCollectorOOPRow
                        key={oop._id}
                        oop={oop}
                        onReviewComplete={refetchOOPs}
                        isMobile={false}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-20">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
               <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-green-800">Bill Collector Dashboard</h1>
                  <Button onClick={refetchOOPs} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </div>

               {/* Tabs Section */}
               {isMobile ? (
                  renderMobileTabSelector()
               ) : (
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
               )}
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
               <Input
                  type="text"
                  placeholder="Search order of payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>

            {/* Table Section */}
            {renderTable()}
         </div>
      </div>
   );
};

export default BillCollectorDashboard;
