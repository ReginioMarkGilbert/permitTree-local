import { FileX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ApplicationFilters from '@/components/DashboardFilters/ApplicationFilters';
import {
   Table,
   TableBody,
   TableHead,
   TableHeader,
   TableRow
} from "@/components/ui/table";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTypewriter } from '@/hooks/useTypewriter';
import { gql, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { useApplications } from '../../../hooks/useApplications';
import TS_ApplicationRow from './TS_ApplicationRow';
import TS_CertificateRow from './TS_CertificateRow';
// import {
//    DropdownMenu,
//    DropdownMenuContent,
//    DropdownMenuItem,
//    DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import DashboardLayout from '@/components/layouts/DashboardLayout';

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

const TechnicalStaffDashboard = () => {
   const [activeMainTab, setActiveMainTab] = useState('Applications');
   const [activeSubTab, setActiveSubTab] = useState('Pending Reviews');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   const mainTabs = ['Applications', 'Awaiting Permit Creation', 'Certificates/Permits'];
   const subTabs = {
      'Applications': ['Pending Reviews', 'Returned Applications', 'Accepted Applications', 'For Inspection and Approval', 'Approved Applications'],
      'Awaiting Permit Creation': ['Awaiting Permit Creation', 'Created Permits'],
      'Certificates/Permits': ['Pending Signature', 'Signed Certificates']
   };

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Pending Reviews':
            return {
               status: 'Submitted',
               currentStage: 'TechnicalStaffReview'
            };
         case 'Returned Applications':
            return {
               currentStage: 'ReturnedByTechnicalStaff',
               status: 'Returned'
            };
         case 'Accepted Applications':
            return { acceptedByTechnicalStaff: true };
         case 'For Inspection and Approval':
            return { currentStage: 'ForInspectionByTechnicalStaff' };
         case 'Approved Applications':
            return {
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               approvedByTechnicalStaff: true
            };
         case 'Awaiting Permit Creation':
            return {
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               awaitingPermitCreation: true,
               PermitCreated: false
            };
         case 'Created Permits':
            return {
               PermitCreated: true
            };
         case 'Pending Signature':
            return {
               status: 'In Progress',
               certificateStatus: 'Pending Signature'
            };
         case 'Signed Certificates':
            return {
               certificateStatus: 'Complete Signatures'
            };
         default:
            toast.error('Invalid subtab selected');
            return {};
      }
   };

   const { applications, loading: appLoading, error: appError, refetch: refetchApps } = useApplications(getQueryParamsForTab(activeSubTab));
   const { data: certificatesData, loading: certificatesLoading, error: certificatesError, refetch: refetchCertificates }
      = useQuery(GET_CERTIFICATES, {
         variables: { status: activeSubTab === 'Pending Signature' ? 'Pending Signature' : 'Complete Signatures' },
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
   }, [refetchApps, activeSubTab]);

   useEffect(() => {
      const pollInterval = setInterval(handleRefetch, 5000); // Poll every 5 seconds
      return () => clearInterval(pollInterval);
   }, [activeMainTab]);

   const handleTabChange = (tab) => {
      // only reset filters if swiching to "Certificates/Permits" tab
      const isCurrentlyCertificates = activeMainTab.includes('Certificates');
      const isTargetCertificates = tab.includes('Certificates');

      setActiveMainTab(tab);
      setActiveSubTab(subTabs[tab][0]);

      // Only reset filters when switching to or from Certificates/Permits tab
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
         case 'draft': return 'bg-gray-100 text-gray-800';
         case 'submitted': return 'bg-blue-100 text-blue-800';
         case 'returned': return 'bg-yellow-100 text-yellow-800';
         case 'accepted': return 'bg-green-100 text-green-800';
         case 'approved': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const isMobile = useMediaQuery('(max-width: 640px)');

   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const renderApplicationTable = () => {
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
                  <TS_ApplicationRow
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
                  <TS_ApplicationRow
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

   const renderCertificatesTable = () => {
      if (certificatesLoading) return <p className="text-center text-gray-500">Loading certificates...</p>;
      if (certificatesError) return <p className="text-center text-red-500">Error loading certificates</p>;
      if (!certificatesData?.getCertificates?.length) {
         return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
               <FileX className="mx-auto h-12 w-12 text-gray-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
               <p className="mt-1 text-sm text-gray-500">No certificates available at this time</p>
            </div>
         );
      }

      // Mobile view
      if (isMobile) {
         return (
            <div className="space-y-4">
               {certificatesData.getCertificates.map((cert) => (
                  <TS_CertificateRow
                     key={cert.id}
                     certificate={cert}
                     onRefetch={handleRefetch}
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
                        Certificate Number
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Number
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Created
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
                  {certificatesData.getCertificates.map((cert) => (
                     <TS_CertificateRow
                        key={cert.id}
                        certificate={cert}
                        onRefetch={handleRefetch}
                        isMobile={false}
                     />
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderTabDescription = () => {
      const descriptions = {
         // Applications
         'Pending Reviews': 'This is the list of applications pending review to check for completeness and supporting documents.',
         'Returned Applications': 'This is the list of applications that were returned due to incomplete documents or other issues.',
         'Accepted Applications': 'This is the list of applications that have been accepted after review.',
         'For Inspection and Approval': 'This is the list of applications that require physical inspection and authenticity verification.',
         'Approved Applications': 'This is the list of applications that have been approved after inspection.',

         // Application Awaiting Certificate/Permit Creation
         'Awaiting Permit Creation': 'This is the list of applications waiting for permit/certificate creation after approval.',
         'Created Permits': 'This is the list of applications with created permits/certificates.',

         // Certificates/Permits
         'Pending Signature': 'This is the list of permits/certificates pending for signature from authorized personnel.',
         'Signed Certificates': 'This is the list of permits/certificates that have been completely signed.'
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
         title="Technical Staff Dashboard"
         description="Manage and process permit applications"
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
         {activeMainTab.includes('Certificates') ? (
            renderCertificatesTable()
         ) : (
            renderApplicationTable()
         )}
      </DashboardLayout>
   );
};

export default TechnicalStaffDashboard;
