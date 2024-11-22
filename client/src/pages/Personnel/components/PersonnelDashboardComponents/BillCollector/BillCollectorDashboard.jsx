import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, FileX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import BillCollectorOOPRow from './BC_OOPRow';
import { gql, useQuery } from '@apollo/client';
import OOPFilters from '@/components/DashboardFilters/OOPFilters';
import { useTypewriter } from '@/hooks/useTypewriter';

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
   const [activeMainTab, setActiveMainTab] = useState('Payment Proof');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      amountRange: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   const mainTabs = ['Awaiting Payment', 'Payment Proof', 'Completed Payments', 'Issued OR'];

   // Use direct query instead of hook
   const {
      data: oopsData,
      loading: oopsLoading,
      error: oopsError,
      refetch: refetchOOPs
   } = useQuery(GET_OOPS, {
      fetchPolicy: 'network-only',
   });

   // Add polling for automatic updates
   useEffect(() => {
      const pollInterval = setInterval(refetchOOPs, 5000); // Poll every 5 seconds
      return () => clearInterval(pollInterval);
   }, []);

   const handleTabChange = (tab) => {
      setActiveMainTab(tab);
      setFilters({
         searchTerm: '',
         applicationType: '',
         amountRange: '',
         dateRange: { from: undefined, to: undefined }
      });
      refetchOOPs();
   };

   const filteredOOPs = useMemo(() => {
      const oops = oopsData?.getOOPs || [];
      return oops.filter(oop => {
         // Filter based on active tab
         if (activeMainTab === 'Payment Proof') {
            return oop.OOPstatus === 'Payment Proof Submitted';
         } else if (activeMainTab === 'Awaiting Payment') {
            return oop.OOPstatus === 'Awaiting Payment';
         } else if (activeMainTab === 'Completed Payments') {
            return oop.OOPstatus === 'Payment Proof Approved' || oop.OOPstatus === 'Completed OOP';
         } else if (activeMainTab === 'Issued OR') {
            return oop.OOPstatus === 'Issued OR';
         }
         return true;
      }).filter(oop => {
         const matchesSearch = oop.applicationId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            oop.billNo.toLowerCase().includes(filters.searchTerm.toLowerCase());

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

         return matchesSearch && matchesType && matchesAmount && matchesDateRange;
      });
   }, [oopsData, activeMainTab, filters]);

   const isMobile = useMediaQuery('(max-width: 640px)');

   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const renderMobileTabSelectors = () => {
      if (isChrome) {
         return (
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
         );
      }

      return (
         <Select value={activeMainTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
               {mainTabs.map((tab) => (
                  <SelectItem key={tab} value={tab}>
                     {tab}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   const renderTabs = () => {
      if (isMobile) {
         return renderMobileTabSelectors();
      }

      return (
         <div className="mb-6 overflow-x-auto">
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

   const renderTabDescription = () => {
      const descriptions = {
         'Payment Proof': 'This is the list of Order of Payments with submitted payment proofs pending verification.',
         'Awaiting Payment': 'This is the list of Order of Payments awaiting payment from applicants.',
         'Completed Payments': 'This is the list of Order of Payments with verified payments.',
         'Issued OR': 'This is the list of Order of Payments with issued Official Receipts.'
      };

      const text = useTypewriter(descriptions[activeMainTab] || '');

      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800 min-h-[20px]">{text}</h1>
         </div>
      );
   };

   const renderContent = () => {
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
      <div className="bg-green-50 min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Bill Collector Dashboard</h1>
                  <Button onClick={refetchOOPs} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </div>

               {/* Tabs Section */}
               {renderTabs()}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="space-y-4">
                  <OOPFilters filters={filters} setFilters={setFilters} />
               </div>
            </div>

            {renderTabDescription()}

            {renderContent()}
         </div>
      </div>
   );
};

export default BillCollectorDashboard;
