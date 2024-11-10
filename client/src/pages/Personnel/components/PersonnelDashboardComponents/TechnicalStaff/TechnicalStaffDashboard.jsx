import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TS_ApplicationRow from './TS_ApplicationRow';
import { useApplications } from '../../../hooks/useApplications';
import { toast } from 'sonner';
import { gql } from '@apollo/client';

const GET_CERTIFICATES = gql`
  query GetCertificates($status: String) {
    getCertificates(status: $status) {
      id
      certificateNumber
      applicationId
      applicationType
      status
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
        fileUrl
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

   const getQueryParamsForTab = (tab) => {
      switch (tab) {
         case 'Pending Reviews':
            return {
               status: 'Submitted',
               currentStage: 'TechnicalStaffReview'
            };
         case 'Returned Applications':
            return { currentStage: 'ReturnedByTechnicalStaff', status: 'Returned' };
         case 'Accepted Applications':
            return { acceptedByTechnicalStaff: true };
         case 'For Inspection and Approval':
            return { currentStage: 'ForInspectionByTechnicalStaff' };
         case 'Approved Applications':
            return { currentStage: 'AuthenticityApprovedByTechnicalStaff', approvedByTechnicalStaff: true };
         // Certificates/Permits
         case 'Awaiting Permit Creation':
            return {
               currentStage: 'AuthenticityApprovedByTechnicalStaff',
               awaitingPermitCreation: true,
               PermitCreated: false
            };
         case 'Created Permits':
            return {
               PermitCreated: true,
               status: 'Pending Signature'  // Only show permits awaiting signature
            };
         default:
            toast.error('Invalid subtab selected');
            return {};
      }
   };

   const { applications, loading, error, refetch } = useApplications(getQueryParamsForTab(activeSubTab));

   const mainTabs = ['Applications', 'Certificates/Permits'];
   const subTabs = {
      'Applications': ['Pending Reviews', 'Returned Applications', 'Accepted Applications', 'For Inspection and Approval', 'Approved Applications'],
      'Certificates/Permits': ['Awaiting Permit Creation', 'Created Permits']
   };

   const filteredApplications = useMemo(() => {
      if (!applications || !Array.isArray(applications)) {
         return [];
      }

      return applications.filter(app => {
         if (!app) return false;

         const searchableFields = [
            app.applicationNumber,
            app.applicationType
         ].filter(Boolean); // Remove any undefined values

         return searchableFields.some(field =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
         );
      });
   }, [applications, searchTerm]);

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
      if (activeSubTab === 'Pending Reviews') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications pending review to check for completeness and supporting documents.</h1>
            </div>
         );
      }
      if (activeSubTab === 'Returned Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that were returned due to incomplete documents or other issues.</h1>
            </div>
         );
      }
      if (activeSubTab === 'Accepted Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that have been accepted after review.</h1>
            </div>
         );
      }
      if (activeSubTab === 'For Inspection and Approval') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications (forwarded by the Chief RPS after review) that are pending inspection (e.g., chainsaws, etc.).</h1>
            </div>
         );
      }
      if (activeSubTab === 'Approved Applications') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that have been approved for authenticity after inspection.</h1>
            </div>
         );
      }
   }

   const renderTable = () => {
      if (loading) return <p className="text-center text-gray-500">Loading applications...</p>;
      if (error) {
         console.error('Error fetching applications:', error);
         return <p className="text-center text-red-500">Error loading applications. Please try again later.</p>;
      }
      if (filteredApplications.length === 0) {
         return <p className="text-center text-gray-500">No applications found.</p>;
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
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">Technical Staff Dashboard</h1>
               <Button onClick={refetch} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>
            {/* Main Tabs - Simplified */}
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {mainTabs.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => {
                           setActiveMainTab(tab);
                           setActiveSubTab(subTabs[tab][0]); // Set first subtab as default for each main tab
                        }}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeMainTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>
            {/* Sub Tabs */}
            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {subTabs[activeMainTab].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeSubTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>
            <div className="mb-6">
               <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>
            {renderTabDescription()}
            {renderTable()}
         </div>
      </div>
   );
};

export default TechnicalStaffDashboard;
