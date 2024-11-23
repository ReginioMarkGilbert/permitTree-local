import React, { useState, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileX, Calendar, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import InspectionApplicationRow from './components/InspectionDashboardComponents/InspectionApplicationRow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ApplicationFilters from '@/components/DashboardFilters/ApplicationFilters';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTypewriter } from '@/hooks/useTypewriter';

const GET_APPLICATIONS_AND_INSPECTIONS = gql`
  query GetApplicationsAndInspections {
    getApplicationsByStatus(currentStage: "ForInspectionByTechnicalStaff") {
      id
      applicationNumber
      applicationType
      dateOfSubmission
      status
    }
    getInspections {
      id
      permitId
      scheduledDate
      scheduledTime
      location
      inspectionStatus
    }
  }
`;

const InspectionSchedulingPage = () => {
   // 1. All useState hooks
   const [activeTab, setActiveTab] = useState('For Schedule');
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });

   // 2. useQuery hook
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS_AND_INSPECTIONS);

   // 3. useMediaQuery hook
   const isMobile = useMediaQuery('(max-width: 640px)');

   // 4. All useMemo hooks
   const getInspectionStatus = useMemo(() => (applicationId) => {
      if (!data?.getInspections) return null;
      return data.getInspections.find(insp => insp.permitId === applicationId);
   }, [data?.getInspections]);

   const formatInspectionStatus = useMemo(() => (inspection) => {
      if (!inspection) return 'Not Scheduled';
      const date = new Date(inspection.scheduledDate);
      return `${inspection.inspectionStatus} - ${format(date, 'MMM d, yyyy')} at ${inspection.scheduledTime}`;
   }, []);

   const isScheduleDisabled = useMemo(() => (applicationId) => {
      const inspection = getInspectionStatus(applicationId);
      return inspection?.inspectionStatus === 'Pending';
   }, [getInspectionStatus]);

   const filteredApplications = useMemo(() => {
      const applications = data?.getApplicationsByStatus || [];

      return applications.filter(app => {
         const inspection = getInspectionStatus(app.id);

         // Filter based on active tab
         if (activeTab === 'For Schedule') {
            return !inspection;
         } else if (activeTab === 'Scheduled Inspection') {
            return inspection?.inspectionStatus === 'Pending';
         } else if (activeTab === 'Completed Inspection') {
            return inspection?.inspectionStatus === 'Completed';
         }
         return true;
      }).filter(app => {
         // Apply search and other filters
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
   }, [data?.getApplicationsByStatus, activeTab, filters, getInspectionStatus]);

   // 5. Event handlers (not hooks)
   const handleTabChange = (tab) => {
      setActiveTab(tab);
      setFilters({
         searchTerm: '',
         applicationType: '',
         dateRange: { from: undefined, to: undefined }
      });
      refetch();
   };

   const tabs = ['For Schedule', 'Scheduled Inspection', 'Completed Inspection'];

   const renderMobileTabSelectors = () => {
      return (
         <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
               {tabs.map((tab) => (
                  <SelectItem key={tab} value={tab}>
                     {tab}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   const renderTabs = () => {
      if (isMobile) {
         return renderMobileTabSelectors();
      }

      return (
         <div className="mb-6 overflow-x-auto">
            <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
               {tabs.map((tab) => (
                  <button
                     key={tab}
                     onClick={() => handleTabChange(tab)}
                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${activeTab === tab
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

   const descriptions = {
      'For Schedule': 'This is the list of applications that need to be scheduled for inspection.',
      'Scheduled Inspection': 'This is the list of applications with pending inspections.',
      'Completed Inspection': 'This is the list of applications with completed inspections.'
   };

   const currentDescription = descriptions[activeTab] || '';
   const animatedText = useTypewriter(currentDescription, 10);

   const renderTabDescription = () => {
      return (
         <div className="mb-4">
            <h1 className="text-sm text-green-800 min-h-[20px]">{animatedText}</h1>
         </div>
      );
   };

   const renderContent = () => {
      if (loading) return <div className="text-center">Loading applications...</div>;
      if (error) return <div className="text-center text-red-600">Error: {error.message}</div>;

      if (filteredApplications.length === 0) {
         return (
            <div className="text-center py-8">
               <FileX className="mx-auto h-12 w-12 text-gray-400" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
               <p className="mt-1 text-sm text-gray-500">
                  No applications available for inspection at this time
               </p>
            </div>
         );
      }

      return (
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Number
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Date
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspection Status
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                     <InspectionApplicationRow
                        key={app.id}
                        application={app}
                        inspection={getInspectionStatus(app.id)}
                        formatInspectionStatus={formatInspectionStatus}
                        isScheduleDisabled={isScheduleDisabled}
                        isMobile={isMobile}
                        onRefetch={refetch}
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
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Inspection Management</h1>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </div>

               {/* Tabs Section */}
               {renderTabs()}

               {/* Description */}
               {renderTabDescription()}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
               <ApplicationFilters filters={filters} setFilters={setFilters} />
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
               {renderContent()}
            </div>
         </div>
      </div>
   );
};

export default InspectionSchedulingPage;
