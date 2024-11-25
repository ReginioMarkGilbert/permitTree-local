import React, { useState, useMemo, useEffect } from 'react';
import { FileX } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import RRC_ApplicationRow from './RRC_ApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import ApplicationFilters from '@/components/DashboardFilters/ApplicationFilters';
import { useTypewriter } from '@/hooks/useTypewriter';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
   Table,
   TableBody,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

const ReceivingReleasingClerkDashboard = () => {
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Applications For Review');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   const mainTabs = ['Applications', 'Certificates'];
   const subTabs = {
      'Applications': ['Applications For Review', 'Returned Applications', 'Accepted Applications', 'Applications For Recording', 'Reviewed/Recorded Applications'],
      'Certificates': ['Pending Release', 'Released Certificates']
   };

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Applications For Review':
            return { currentStage: 'ReceivingClerkReview' };
         case 'Returned Applications':
            return { currentStage: 'ReturnedByReceivingClerk' };
         case 'Accepted Applications':
            return { acceptedByReceivingClerk: true };
         case 'Applications For Recording':
            return { currentStage: 'ForRecordByReceivingClerk', recordedByReceivingClerk: false };
         case 'Reviewed/Recorded Applications':
            return { recordedByReceivingClerk: true };
         case 'Pending Release':
            return { status: 'Approved', currentStage: 'PendingRelease' };
         case 'Released Certificates':
            return { status: 'Released' };
         default:
            return { currentStage: 'ForRecordByReceivingClerk' };
      }
   };

   const { applications, loading: appLoading, error: appError, refetch: refetchApps } = useApplications(getQueryParamsForTab(activeSubTab));

   const handleRefetch = () => {
      refetchApps();
   };

   useEffect(() => {
      refetchApps();
   }, [refetchApps, activeSubTab]);

   useEffect(() => {
      const pollInterval = setInterval(handleRefetch, 5000);
      return () => clearInterval(pollInterval);
   }, [activeMainTab]);

   const handleTabChange = (tab) => {
      const isCurrentlyCertificates = activeMainTab.includes('Certificates');
      const isTargetCertificates = tab.includes('Certificates');

      setActiveMainTab(tab);
      setActiveSubTab(subTabs[tab][0]);

      if (isCurrentlyCertificates !== isTargetCertificates) {
         setFilters({
            searchTerm: '',
            applicationType: '',
            dateRange: { from: undefined, to: undefined }
         });
      }

      handleRefetch();
   };

   const handleSubTabChange = (tab) => {
      setActiveSubTab(tab);
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

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'pending': return 'bg-yellow-100 text-yellow-800';
         case 'recorded': return 'bg-blue-100 text-blue-800';
         case 'pending release': return 'bg-orange-100 text-orange-800';
         case 'released': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const isMobile = useMediaQuery('(max-width: 640px)');

   const renderTabDescription = () => {
      const descriptions = {
         'Applications For Review': 'This is the list of applications pending initial review and encoding.',
         'Returned Applications': 'This is the list of applications that were returned due to incomplete requirements.',
         'Accepted Applications': 'This is the list of applications that have been accepted and encoded.',
         'Applications For Recording': 'This is the list of applications pending for recording in the logbook.',
         'Reviewed/Recorded Applications': 'This is the list of applications that have been recorded in the logbook.',
         'Pending Release': 'This is the list of permits/certificates ready for release to applicants.',
         'Released Certificates': 'This is the list of permits/certificates that have been released to applicants.'
      };

      const text = useTypewriter(descriptions[activeSubTab] || '');

      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm min-h-[20px] text-black dark:text-gray-300">{text}</h1>
         </div>
      );
   };

   const renderContent = () => {
      if (appLoading) {
         return <div className="flex justify-center py-8">Loading applications...</div>;
      }

      if (appError) {
         return <div className="text-destructive text-center py-8">Error loading applications</div>;
      }

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
                  <RRC_ApplicationRow
                     key={app.id}
                     app={app}
                     onRecordComplete={handleRefetch}
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
                  <RRC_ApplicationRow
                     key={app.id}
                     app={app}
                     onRecordComplete={handleRefetch}
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
         title="Receiving/Releasing Clerk Dashboard"
         description="Manage and process applications and certificates"
         onRefresh={handleRefetch}
         isMobile={isMobile}
         mainTabs={mainTabs}
         subTabs={subTabs}
         activeMainTab={activeMainTab}
         activeSubTab={activeSubTab}
         onMainTabChange={handleTabChange}
         onSubTabChange={handleSubTabChange}
         tabDescription={renderTabDescription()}
         filters={<ApplicationFilters filters={filters} setFilters={setFilters} />}
      >
         {renderContent()}
      </DashboardLayout>
   );
};

export default ReceivingReleasingClerkDashboard;
