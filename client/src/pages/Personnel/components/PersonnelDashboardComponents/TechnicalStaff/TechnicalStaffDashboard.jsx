import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TS_ApplicationRow from './TS_ApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import { toast } from 'sonner';
import { gql, useQuery } from '@apollo/client';
import TechnicalStaffApplicationFilters from './TechnicalStaffApplicationFilters';
import TS_CertificateRow from './TS_CertificateRow';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/ui/dialog";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

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
   const [searchTerm, setSearchTerm] = useState('');
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

   const isMobile = useMediaQuery('(max-width: 640px)');

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
         // Certificates/Permits
         case 'Awaiting Permit Creation':
            return {
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               awaitingPermitCreation: true,
               PermitCreated: false
            };
         // Applications awaiting certificate/permit creation
         case 'Created Permits':
            return {
               // certificateStatus: 'Pending Signature',
               PermitCreated: true
            };
         case 'Pending Signature':
            return {
               status: 'In Progress',
               certificateStatus: 'Pending Signature'
            };
         // Certificates/Permits
         case 'Signed Certificates':
            return {
               certificateStatus: 'Complete Signatures'
            };
         default:
            toast.error('Invalid subtab selected');
            return {};
      }
   };

   const { applications, loading, error, refetch } = useApplications(getQueryParamsForTab(activeSubTab));

   const { data: certificatesData, loading: certificatesLoading, error: certificatesError, refetch: refetchCertificates }
      = useQuery(GET_CERTIFICATES, {
         variables: { status: activeSubTab === 'Pending Signature' ? 'Pending Signature' : 'Complete Signatures' },
         skip: !activeMainTab.includes('Certificates'),
      });

   const mainTabs = ['Applications', 'Application Awaiting Certificate/Permit Creation', 'Certificates/Permits'];
   const subTabs = {
      'Applications': ['Pending Reviews', 'Returned Applications', 'Accepted Applications', 'For Inspection and Approval', 'Approved Applications'],
      'Application Awaiting Certificate/Permit Creation': ['Awaiting Permit Creation', 'Created Permits'],
      'Certificates/Permits': ['Pending Signature', 'Signed Certificates']
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

   useEffect(() => {
      refetch();
   }, [refetch, activeSubTab]);

   const handleReviewComplete = () => {
      refetch();
   };

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

   const renderTabDescription = () => {
      const [text, setText] = useState('');
      const descriptions = {
         'Pending Reviews': 'This is the list of applications pending review to check for completeness and supporting documents.',
         'Returned Applications': 'This is the list of applications that were returned due to incomplete documents or other issues.',
         'Accepted Applications': 'This is the list of applications that have been accepted after review.',
         'For Inspection and Approval': 'This is the list of applications (forwarded by the Chief RPS after review) that are pending inspection (e.g., chainsaws, etc.).',
         'Approved Applications': 'This is the list of applications that have been approved for authenticity after inspection.'
      };

      useEffect(() => {
         setText(''); // Reset text when tab changes
         const targetText = descriptions[activeSubTab] || '';
         let currentIndex = 0;

         const interval = setInterval(() => {
            if (currentIndex <= targetText.length) { // if not done typing
               setText(targetText.slice(0, currentIndex)); // add one character
               currentIndex++; // increment index. example: T: 0, R: 1, U: 2, E: 3, ...
            } else {
               clearInterval(interval); // if done typing, clear interval
            }
         }, 12); // speed ms

         return () => clearInterval(interval);
      }, [activeSubTab]);

      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm text-green-800">{text}</h1>
         </div>
      );
   }

   const renderFilters = () => {
      return <TechnicalStaffApplicationFilters filters={filters} setFilters={setFilters} />;
   };

   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const renderMobileTabSelectors = () => {
      if (isChrome) {
         return (
            <div className="space-y-4">
               <select
                  value={activeMainTab}
                  onChange={(e) => {
                     setActiveMainTab(e.target.value);
                     setActiveSubTab(subTabs[e.target.value][0]);
                  }}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
               >
                  {mainTabs.map((tab) => (
                     <option key={tab} value={tab}>
                        {tab}
                     </option>
                  ))}
               </select>

               <select
                  value={activeSubTab}
                  onChange={(e) => setActiveSubTab(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
               >
                  {subTabs[activeMainTab].map((tab) => (
                     <option key={tab} value={tab}>
                        {tab}
                     </option>
                  ))}
               </select>
            </div>
         );
      }

      return (
         <div className="space-y-4">
            <Select value={activeMainTab} onValueChange={(tab) => {
               setActiveMainTab(tab);
               setActiveSubTab(subTabs[tab][0]);
            }}>
               <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tab" />
               </SelectTrigger>
               <SelectContent>
                  {mainTabs.map((tab) => (
                     <SelectItem key={tab} value={tab}>
                        {tab}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Select value={activeSubTab} onValueChange={setActiveSubTab}>
               <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
               </SelectTrigger>
               <SelectContent>
                  {subTabs[activeMainTab].map((tab) => (
                     <SelectItem key={tab} value={tab}>
                        {tab}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
      );
   };

   const renderTabs = () => {
      if (isMobile) {
         return renderMobileTabSelectors();
      }

      return (
         <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap overflow-x-auto">
               {mainTabs.map((tab) => (
                  <button
                     key={tab}
                     onClick={() => {
                        setActiveMainTab(tab);
                        setActiveSubTab(subTabs[tab][0]);
                     }}
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

   const renderSubTabs = () => {
      if (isMobile) {
         return null;
      }

      return (
         <div className="bg-gray-100 p-1 rounded-md inline-flex flex-wrap gap-1">
            {subTabs[activeMainTab].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                     ${activeSubTab === tab
                        ? 'bg-white text-green-800 shadow'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
               >
                  {tab}
               </button>
            ))}
         </div>
      );
   };

   const renderTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (error) {
         console.error('Error fetching applications:', error);
         return <p className="text-center text-red-500">Error loading applications. Please try again later.</p>;
      }
      if (filteredApplications.length === 0) {
         return <p className="text-center text-gray-500">No applications found.</p>;
      }

      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredApplications.map((app) => (
                  <TS_ApplicationRow
                     key={app.id}
                     app={app}
                     onReviewComplete={handleReviewComplete}
                     getStatusColor={getStatusColor}
                     currentTab={activeSubTab}
                  />
               ))}
            </div>
         );
      }

      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION NUMBER</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION TYPE</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                     <TS_ApplicationRow
                        key={app.id}
                        app={app}
                        onReviewComplete={handleReviewComplete}
                        getStatusColor={getStatusColor}
                        currentTab={activeSubTab}
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
                  <h1 className="text-2xl font-semibold text-gray-900">Technical Staff Dashboard</h1>
                  <Button onClick={refetch} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </div>

               {/* Tabs Section */}
               {isMobile ? renderMobileTabSelectors() : renderTabs()}

               {/* Adjusted Description Section */}
               <div className="mt-6 text-sm text-gray-600">
                  {renderTabDescription()}
               </div>
            </div>

            {/* Sub Tabs and Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="space-y-4">
                  {!isMobile && renderSubTabs()}
                  {renderFilters()}
               </div>
            </div>

            {renderTable()}
         </div>
      </div>
   );
};

export default TechnicalStaffDashboard;
