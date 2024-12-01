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
import { gql, useQuery } from '@apollo/client';

const GET_CERTIFICATES = gql`
  query GetCertificates($status: String) {
    getCertificates(status: $status) {
      id
      certificateNumber
      applicationId
      applicationType
      certificateStatus
      dateCreated
      certificateData {
        registrationType
        ownerName
        address
        chainsawDetails {
          brand
          model
          serialNumber
          dateOfAcquisition
          powerOutput
          maxLengthGuidebar
          countryOfOrigin
          purchasePrice
        }
      }
      uploadedCertificate {
        fileData
        filename
        contentType
        uploadDate
        metadata {
          certificateType
          issueDate
          expiryDate
          remarks
        }
      }
    }
  }
`;

const PENRCENROfficerDashboard = () => {
   const [activeMainTab, setActiveMainTab] = useState('Pending Signature');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   // Remove nested structure, use flat main tabs
   const mainTabs = [
      'Pending Signature',
      'Signed Certificates'
   ];

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Pending Signature':
            return {
               currentStage: 'PendingSignatureByPENRCENROfficer',
               hasCertificate: true,
               PermitCreated: true
            };
         case 'Signed Certificates':
            return {
               // currentStage: 'PendingRelease',
               certificateSignedByPENRCENROfficer: true,
               hasCertificate: true
            };
         default:
            return {};
      }
   };

   const { applications, loading: appLoading, error: appError, refetch: refetchApps } = useApplications(getQueryParamsForTab(activeMainTab));

   const { data: certificatesData, loading: certificatesLoading, error: certificatesError, refetch: refetchCertificates }
      = useQuery(GET_CERTIFICATES, {
         variables: { status: activeMainTab === 'Pending Signature' ? 'Pending Signature' : 'Complete Signatures' },
         skip: !activeMainTab.includes('Certificates'),
      });

   const handleRefetch = () => {
      if (activeMainTab.includes('Certificates')) {
         refetchCertificates();
      } else {
         refetchApps();
      }
   };

   useEffect(() => {
      refetchApps();
   }, [refetchApps, activeMainTab]);

   useEffect(() => {
      const pollInterval = setInterval(handleRefetch, 5000);
      return () => clearInterval(pollInterval);
   }, [activeMainTab]);

   const handleTabChange = (tab) => {
      setActiveMainTab(tab);
      setFilters({
         searchTerm: '',
         applicationType: '',
         dateRange: { from: undefined, to: undefined }
      });
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
         'Pending Signature': 'This is the list of permits/certificates pending for your signature.',
         'Signed Certificates': 'This is the list of permits/certificates that you have signed.'
      };

      const text = useTypewriter(descriptions[activeMainTab] || '');

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
         title="PENR/CENR Officer Dashboard"
         description="Manage and process applications and certificates"
         onRefresh={handleRefetch}
         isMobile={isMobile}
         mainTabs={mainTabs}
         activeMainTab={activeMainTab}
         onMainTabChange={handleTabChange}
         tabDescription={renderTabDescription()}
         filters={<ApplicationFilters filters={filters} setFilters={setFilters} />}
      >
         {renderContent()}
      </DashboardLayout>
   );
};

export default PENRCENROfficerDashboard;
