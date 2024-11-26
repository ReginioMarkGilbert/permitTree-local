import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, FileX } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ChiefApplicationRow from './ChiefApplicationRow';
import ChiefOOPRow from './ChiefOOPRow';
import { useApplications } from '../../../hooks/useApplications';
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';
import ApplicationFilters from '@/components/DashboardFilters/ApplicationFilters';
import OOPFilters from '@/components/DashboardFilters/OOPFilters';
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
            <h1 className="text-sm min-h-[20px] text-black dark:text-gray-300">{text}</h1>
         </div>
      );
   };

   const renderOOPTable = () => {
      if (oopsLoading) return <div className="flex justify-center py-8">Loading order of payments...</div>;
      if (oopsError) return <div className="text-destructive text-center py-8">Error loading order of payments</div>;
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
                  <ChiefOOPRow
                     key={oop._id}
                     oop={oop}
                     onRefetch={handleRefetch}
                     isMobile={false}
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
                  <ChiefApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleReviewComplete}
                     getStatusColor={getStatusColor}
                     currentTab={activeSubTab}
                     isMobile={false}
                  />
               ))}
            </TableBody>
         </Table>
      );
   };

   return (
      <DashboardLayout
         title="Chief RPS/TSD Dashboard"
         description="Manage and process applications and order of payments"
         onRefresh={handleRefetch}
         isMobile={isMobile}
         mainTabs={mainTabs}
         subTabs={subTabs}
         activeMainTab={activeMainTab}
         activeSubTab={activeSubTab}
         onMainTabChange={handleTabChange}
         onSubTabChange={handleSubTabChange}
         tabDescription={renderTabDescription()}
         filters={activeMainTab === 'Order Of Payment' ?
            <OOPFilters filters={filters} setFilters={setFilters} /> :
            <ApplicationFilters filters={filters} setFilters={setFilters} />
         }
      >
         {activeMainTab === 'Order Of Payment' ? renderOOPTable() : renderApplicationTable()}
      </DashboardLayout>
   );
};

export default ChiefDashboard;
