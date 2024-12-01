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
import TechnicalStaffOOPRow from './TechnicalStaffOOPRow';
import { useOrderOfPayments } from '../../../hooks/useOrderOfPayments';

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

   // const mainTabs = ['Applications', 'Awaiting Permit Creation', 'Certificates/Permits'];
   const mainTabs = ['Applications', 'Order of Payment', 'Awaiting Permit Creation', 'Certificates/Permits'];
   const subTabs = {
      'Applications': ['Pending Reviews', 'Returned Applications', 'Accepted Applications', 'For Inspection and Approval', 'Approved Applications'],
      'Order of Payment': ['Pending Approval', 'Approved OOP'],
      'Awaiting Permit Creation': ['Awaiting Permit Creation', 'Created Permits'],
      'Certificates/Permits': ['Pending Release', 'Released Certificates']
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
               approvedByTechnicalStaff: true
            };
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
         case 'Pending Release':
            return {
               currentStage: 'PendingRelease',
               status: 'In Progress',
               certificateSignedByPENRCENROfficer: true,
               hasCertificate: true,
               PermitCreated: true
            };
         case 'Released Certificates':
            return {
               // currentStage: 'Released',
               // status: 'Released',
               certificateSignedByPENRCENROfficer: true,
               hasCertificate: true
            };
         case 'Pending Approval':
            return { OOPstatus: 'For Approval' };
         case 'Approved OOP':
            return { OOPstatus: 'Awaiting Payment' };
         default:
            console.error('Invalid subtab selected:', tab);
            return {};
      }
   };

   const { applications, loading: appLoading, error: appError, refetch: refetchApps } = useApplications(getQueryParamsForTab(activeSubTab));
   const { data: certificatesData, loading: certificatesLoading, error: certificatesError, refetch: refetchCertificates }
      = useQuery(GET_CERTIFICATES, {
         variables: { status: activeSubTab === 'Pending Signature' ? 'Pending Signature' : 'Complete Signatures' },
         skip: !activeMainTab.includes('Certificates'),
      });

   const { oops, oopsLoading, oopsError, refetch: refetchOOPs } = useOrderOfPayments();

   const handleRefetch = () => {
      // if (activeMainTab.includes('Certificates')) {
      //    refetchCertificates();
      if (activeMainTab === 'Order of Payment') {
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

   const filteredOOPs = useMemo(() => {
      if (!oops) return [];

      return oops.filter(oop => {
         // First filter by status based on activeSubTab
         const matchesStatus = (() => {
            if (activeSubTab === 'Pending Approval') {
               return oop.OOPstatus === 'For Approval';
            } else if (activeSubTab === 'Approved OOP') {
               return oop.OOPstatus === 'Awaiting Payment';
            }
            return true;
         })();

         // Then apply search filter
         const matchesSearch = !filters.searchTerm ||
            oop.applicationId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            oop.billNo.toLowerCase().includes(filters.searchTerm.toLowerCase());

         // Apply application type filter
         const matchesType = !filters.applicationType ||
            filters.applicationType === "all" ||
            oop.applicationType === filters.applicationType;

         // Apply date range filter
         const matchesDateRange = (() => {
            if (!filters.dateRange.from && !filters.dateRange.to) return true;
            const oopDate = new Date(parseInt(oop.createdAt));
            const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
            const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
            return (!fromDate || oopDate >= fromDate) && (!toDate || oopDate <= toDate);
         })();

         return matchesStatus && matchesSearch && matchesType && matchesDateRange;
      });
   }, [oops, filters, activeSubTab]);

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
                  <TableHead className="w-[25%]">Application Number</TableHead>
                  <TableHead className="w-[25%] text-center">Application Type</TableHead>
                  <TableHead className="w-[20%] text-center">Date</TableHead>
                  <TableHead className="w-[15%] text-center">Status</TableHead>
                  <TableHead className="w-[15%] text-center">Actions</TableHead>
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

   const renderOrderOfPaymentTable = () => {
      if (oopsLoading) return <div className="flex justify-center py-8">Loading order of payments...</div>;
      if (oopsError) return <div className="text-destructive text-center py-8">Error loading order of payments</div>;

      if (!filteredOOPs || filteredOOPs.length === 0) {
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
                  <TableHead className="w-[25%]">Application Number</TableHead>
                  <TableHead className="w-[15%] text-center">Bill Number</TableHead>
                  <TableHead className="w-[15%] text-center">Date</TableHead>
                  <TableHead className="w-[15%] text-center">Amount</TableHead>
                  <TableHead className="w-[15%] text-center">Status</TableHead>
                  <TableHead className="w-[15%] text-center">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredOOPs.map((oop) => (
                  <TechnicalStaffOOPRow
                     key={oop._id}
                     oop={oop}
                     onReviewComplete={handleRefetch}
                     currentTab={activeSubTab}
                  />
               ))}
            </TableBody>
         </Table>
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
         'Pending Release': 'This is the list of permits/certificates that are ready for release to the applicant.',
         'Released Certificates': 'This is the list of permits/certificates that have been released to the applicant.',

         // Order of Payment
         'Pending Approval': 'This is the list of Order of Payments pending for your approval.',
         'Approved OOP': 'This is the list of Order of Payments that you have approved.'
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
         {activeMainTab === 'Order of Payment' ?
            renderOrderOfPaymentTable() :
            renderApplicationTable()
         }
      </DashboardLayout>
   );
};

export default TechnicalStaffDashboard;
