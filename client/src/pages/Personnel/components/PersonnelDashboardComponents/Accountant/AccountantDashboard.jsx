// Accountant and OOP Staff Incharge Dashboard

import React, { useState, useMemo } from 'react';
import { FileX } from 'lucide-react';
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';
import AccountantOOPRow from './AccountantOOPRow';
import AccountantApplicationRow from './AccountantApplicationRow';
import AccountantFilters from './AccountantFilters';
import { useTypewriter } from '@/hooks/useTypewriter';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { useApplications } from '../../../hooks/useApplications';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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

   const isMobile = useMediaQuery('(max-width: 768px)');

   const mainTabs = ['Order Of Payment', 'Applications awaiting OOP'];
   const subTabs = {
      'Order Of Payment': ['Pending Approval', 'Approved OOP'],
      'Applications awaiting OOP': ['Awaiting OOP', 'Created OOP']
   };

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Awaiting OOP':
            return {
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               awaitingOOP: true,
               OOPCreated: false
            };
         case 'Created OOP':
            return {
               OOPCreated: true,
               awaitingOOP: false
            };
         default:
            return {};
      }
   };

   const {
      applications,
      loading: appLoading,
      error: appError,
      refetch: refetchApps
   } = useApplications(getQueryParamsForTab(activeSubTab));

   const {
      oops,
      oopsLoading,
      oopsError,
      refetch: refetchOOPs
   } = useOrderOfPayments();

   const handleReviewComplete = () => {
      refetchOOPs();
   };

   const handleTabChange = (tab) => {
      setActiveMainTab(tab);
      setActiveSubTab(subTabs[tab][0]);
      setFilters({
         searchTerm: '',
         applicationType: '',
         amountRange: '',
         dateRange: { from: undefined, to: undefined }
      });
      refetchOOPs();
   };

   const handleSubTabChange = (tab) => {
      setActiveSubTab(tab);
      refetchOOPs();
   };

   const handleRefetch = () => {
      if (activeMainTab === 'Order Of Payment') {
         refetchOOPs();
      } else {
         refetchApps();
      }
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

   const filteredApplications = useMemo(() => {
      if (!applications) return [];

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

   const renderOrderOfPaymentTable = () => {
      if (oopsLoading) return <div className="flex justify-center py-8">Loading order of payments...</div>;
      if (oopsError) return <div className="text-destructive text-center py-8">Error loading order of payments</div>;
      if (filteredOOPs.length === 0) {
         return (
            <div className="text-center py-8">
               <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
               <h3 className="mt-2 text-lg font-semibold">No order of payments found</h3>
               <p className="text-sm text-muted-foreground">
                  {filters.applicationType ?
                     `No order of payments found for ${filters.applicationType}` :
                     'No order of payments available'}
               </p>
            </div>
         );
      }

      return (
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[180px]">Application Number</TableHead>
                  <TableHead className="w-[150px]">Bill Number</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[120px]">Amount</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px] text-end">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredOOPs.map((oop) => (
                  <AccountantOOPRow
                     key={oop._id}
                     oop={oop}
                     onReviewComplete={handleReviewComplete}
                     currentTab={activeSubTab}
                  />
               ))}
            </TableBody>
         </Table>
      );
   };

   const renderApplicationTable = () => {
      if (appLoading) return <div className="flex justify-center py-8">Loading applications...</div>;
      if (appError) return <div className="text-destructive text-center py-8">Error loading applications</div>;
      if (filteredApplications.length === 0) {
         return (
            <div className="text-center py-8">
               <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
               <h3 className="mt-2 text-lg font-semibold">No applications found</h3>
               <p className="text-sm text-muted-foreground">
                  {filters.applicationType ?
                     `No applications found for ${filters.applicationType}` :
                     'No applications available'}
               </p>
            </div>
         );
      }

      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredApplications.map((app) => (
                  <AccountantApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleReviewComplete}
                     currentTab={activeSubTab}
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
                  <TableHead>Application Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredApplications.map((app) => (
                  <AccountantApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleReviewComplete}
                     currentTab={activeSubTab}
                     isMobile={false}
                  />
               ))}
            </TableBody>
         </Table>
      );
   };

   const renderTabDescription = () => {
      const descriptions = {
         'Pending Approval': 'This is the list of Order of Payments pending for your approval.',
         'Approved OOP': 'This is the list of Order of Payments that you have approved.',
         'Awaiting OOP': 'This is the list of applications waiting for Order of Payment creation.',
         'Created OOP': 'This is the list of applications with created Order of Payments.'
      };

      const text = useTypewriter(descriptions[activeSubTab] || '');

      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm min-h-[20px] text-black dark:text-gray-300">{text}</h1>
         </div>
      );
   };

   return (
      <DashboardLayout
         title="Accountant Dashboard"
         description="Manage and process order of payments"
         onRefresh={handleRefetch}
         isMobile={isMobile}
         mainTabs={mainTabs}
         subTabs={subTabs}
         activeMainTab={activeMainTab}
         activeSubTab={activeSubTab}
         onMainTabChange={handleTabChange}
         onSubTabChange={handleSubTabChange}
         tabDescription={renderTabDescription()}
         filters={
            <AccountantFilters
               filters={filters}
               setFilters={setFilters}
               activeMainTab={activeMainTab}
            />
         }
      >
         {activeMainTab === 'Order Of Payment' ?
            renderOrderOfPaymentTable() :
            renderApplicationTable()
         }
      </DashboardLayout>
   );
};

export default AccountantDashboard;
