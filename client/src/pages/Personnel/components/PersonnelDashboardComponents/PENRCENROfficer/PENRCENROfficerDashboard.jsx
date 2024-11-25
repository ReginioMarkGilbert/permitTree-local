import React, { useState, useMemo, useEffect } from 'react';
import { FileX } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ApplicationRow from './PCOApplicationRow';
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

const PENRCENROfficerDashboard = () => {
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

   const mainTabs = ['Applications', 'Applications Awaiting OOP', 'Applications Inspection Reports', 'Certificates/Permits'];
   const subTabs = {
      'Applications': ['Applications for Review', 'Accepted Applications'],
      'Applications Inspection Reports': ['Reports for Review', 'Reviewed Reports'],
      'Applications Awaiting OOP': ['Awaiting OOP', 'Created OOP'],
      'Certificates/Permits': ['Pending Certification', 'Certified Certificates']
   };

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Reports for Review':
            return { currentStage: 'InspectionReportForReviewByPENRCENROfficer', hasInspectionReport: true };
         case 'Reviewed Reports':
            return { InspectionReportsReviewedByPENRCENROfficer: true };
         case 'Applications for Review':
            return { currentStage: 'CENRPENRReview' };
         case 'Accepted Applications':
            return { acceptedByPENRCENROfficer: true };
         case 'Awaiting OOP':
            return { awaitingOOP: true };
         case 'Created OOP':
            return { awaitingOOP: false, OOPCreated: true, status: 'In Progress' };
         case 'Pending Certification':
            return { currentStage: 'PENRCENRCertification' };
         case 'Certified Certificates':
            return { currentStage: 'PENRCENRCertified' };
         default:
            return {};
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
      if (!applications || !Array.isArray(applications)) {
         return [];
      }

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
         case 'pending review': return 'bg-yellow-100 text-yellow-800';
         case 'approved': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const isMobile = useMediaQuery('(max-width: 640px)');

   const renderTabDescription = () => {
      const descriptions = {
         'Applications for Review': 'This is the list of applications pending for your review.',
         'Accepted Applications': 'This is the list of applications that you have accepted after review.',
         'Reports for Review': 'This is the list of inspection reports that require your review and approval.',
         'Reviewed Reports': 'This is the list of inspection reports that you have already reviewed.',
         'Awaiting OOP': 'This is the list of applications waiting for Order of Payment creation.',
         'Created OOP': 'This is the list of applications with created Order of Payments.',
         'Pending Certification': 'This is the list of permits/certificates pending for your certification.',
         'Certified Certificates': 'This is the list of permits/certificates that you have certified.'
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
                  <ApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleRefetch}
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
                  <ApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleRefetch}
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
         title="PENR/CENR Officer Dashboard"
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

export default PENRCENROfficerDashboard;
