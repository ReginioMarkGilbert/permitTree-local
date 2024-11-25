import React, { useState, useMemo, useEffect } from 'react';
import { FileX } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import BillCollectorOOPRow from './BC_OOPRow';
import { gql, useQuery } from '@apollo/client';
import OOPFilters from '@/components/DashboardFilters/OOPFilters';
import { useTypewriter } from '@/hooks/useTypewriter';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
   Table,
   TableBody,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

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
   const subTabs = {};

   const {
      data: oopsData,
      loading: oopsLoading,
      error: oopsError,
      refetch: refetchOOPs
   } = useQuery(GET_OOPS, {
      fetchPolicy: 'network-only',
   });

   useEffect(() => {
      const pollInterval = setInterval(refetchOOPs, 5000);
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
            <h1 className="text-sm min-h-[20px] text-black dark:text-gray-300">{text}</h1>
         </div>
      );
   };

   const renderContent = () => {
      if (oopsLoading) {
         return <div className="flex justify-center py-8">Loading order of payments...</div>;
      }

      if (oopsError) {
         return <div className="text-destructive text-center py-8">Error loading order of payments</div>;
      }

      if (filteredOOPs.length === 0) {
         return (
            <div className="text-center py-8">
               <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
               <h3 className="mt-2 text-lg font-semibold">No orders of payment found</h3>
               <p className="text-sm text-muted-foreground">
                  {filters.applicationType ?
                     `No orders of payment found for ${filters.applicationType}` :
                     'No orders of payment available'}
               </p>
            </div>
         );
      }

      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredOOPs.map((oop) => (
                  <BillCollectorOOPRow
                     key={oop._id}
                     oop={oop}
                     onReviewComplete={refetchOOPs}
                     currentTab={activeMainTab}
                     isMobile={true}
                  />
               ))}
            </div>
         );
      }

      return (
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Application Number</TableHead>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredOOPs.map((oop) => (
                  <BillCollectorOOPRow
                     key={oop._id}
                     oop={oop}
                     onReviewComplete={refetchOOPs}
                     currentTab={activeMainTab}
                     isMobile={false}
                  />
               ))}
            </TableBody>
         </Table>
      );
   };

   return (
      <DashboardLayout
         title="Bill Collector Dashboard"
         description="Manage and process order of payments"
         onRefresh={refetchOOPs}
         isMobile={isMobile}
         mainTabs={mainTabs}
         subTabs={subTabs}
         activeMainTab={activeMainTab}
         activeSubTab={activeMainTab}
         onMainTabChange={handleTabChange}
         onSubTabChange={handleTabChange}
         tabDescription={renderTabDescription()}
         filters={<OOPFilters filters={filters} setFilters={setFilters} />}
      >
         {renderContent()}
      </DashboardLayout>
   );
};

export default BillCollectorDashboard;
