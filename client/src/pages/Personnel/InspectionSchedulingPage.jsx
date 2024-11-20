import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import TS_ScheduleInspectionModal from './components/PersonnelDashboardComponents/TechnicalStaff/TS_ScheduleInspectionModal';
import TS_InspectionReportModal from './components/PersonnelDashboardComponents/TechnicalStaff/TS_InspectionReportModal';

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
   const [selectedApp, setSelectedApp] = useState(null);
   const [showScheduleModal, setShowScheduleModal] = useState(false);
   const [showReportModal, setShowReportModal] = useState(false);
   const [selectedInspection, setSelectedInspection] = useState(null);
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS_AND_INSPECTIONS);

   const handleSchedule = (application) => {
      setSelectedApp(application);
      setShowScheduleModal(true);
   };

   // Helper function to get inspection status for an application
   const getInspectionStatus = (applicationId) => {
      if (!data?.getInspections) return null;

      const inspection = data.getInspections.find(
         insp => insp.permitId === applicationId
      );

      if (!inspection) return null;

      return {
         id: inspection.id,
         inspectionStatus: inspection.inspectionStatus,
         scheduledDate: inspection.scheduledDate,
         scheduledTime: inspection.scheduledTime,
         location: inspection.location
      };
   };

   // Helper function to format inspection status display
   const formatInspectionStatus = (inspection) => {
      if (!inspection) return 'Not Scheduled';

      const date = new Date(inspection.scheduledDate);
      return `${inspection.inspectionStatus} - ${format(date, 'MMM d, yyyy')} at ${inspection.scheduledTime}`;
   };

   // Helper function to determine if schedule button should be disabled
   const isScheduleDisabled = (applicationId) => {
      const inspection = getInspectionStatus(applicationId);
      return inspection?.inspectionStatus === 'Pending';
   };

   if (loading) return (
      <div className="min-h-screen bg-green-50 pt-24">
         <div className="container mx-auto px-4">
            <div className="text-center">Loading applications...</div>
         </div>
      </div>
   );

   if (error) return (
      <div className="min-h-screen bg-green-50 pt-24">
         <div className="container mx-auto px-4">
            <div className="text-center text-red-600">Error: {error.message}</div>
         </div>
      </div>
   );

   const applications = data?.getApplicationsByStatus || [];

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-8 pt-24">
            <div className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                     Applications Awaiting Inspection
                  </h1>
                  <Button
                     onClick={() => refetch()}
                     variant="outline"
                     className="flex items-center gap-2"
                  >
                     <RefreshCw className="h-4 w-4" />
                     Refresh
                  </Button>
               </div>

               {applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                     No applications awaiting inspection
                  </div>
               ) : (
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
                           {applications.map((app) => {
                              const inspection = getInspectionStatus(app.id);
                              return (
                                 <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       {app.applicationNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       {app.applicationType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       {format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       <span className={`px-2 py-1 rounded-full text-xs font-medium
   ${inspection?.inspectionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                             inspection?.inspectionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                                inspection?.inspectionStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                   'bg-gray-100 text-gray-800'}`}>
                                          {formatInspectionStatus(inspection)}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="flex space-x-2">
                                          <Button
                                             onClick={() => handleSchedule(app)}
                                             variant="outline"
                                             className="flex items-center space-x-2"
                                             disabled={isScheduleDisabled(app.id)}
                                          >
                                             <Calendar className="h-4 w-4" />
                                             <span>
                                                {isScheduleDisabled(app.id)
                                                   ? 'Inspection Scheduled'
                                                   : inspection?.inspectionStatus === 'Completed'
                                                      ? 'Reschedule Inspection'
                                                      : 'Schedule Inspection'}
                                             </span>
                                          </Button>
                                          {inspection?.inspectionStatus === 'Pending' && (
                                             <Button
                                                onClick={() => {
                                                   setSelectedInspection(inspection);
                                                   setSelectedApp(app);
                                                   setShowReportModal(true);
                                                }}
                                                variant="outline"
                                                className="flex items-center space-x-2"
                                             >
                                                <FileCheck className="h-4 w-4" />
                                                <span>Complete Inspection</span>
                                             </Button>
                                          )}
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>

         {showScheduleModal && (
            <TS_ScheduleInspectionModal
               isOpen={showScheduleModal}
               onClose={() => setShowScheduleModal(false)}
               application={selectedApp}
               onScheduleComplete={refetch}
            />
         )}

         {showReportModal && (
            <TS_InspectionReportModal
               isOpen={showReportModal}
               onClose={() => setShowReportModal(false)}
               inspection={selectedInspection}
               application={selectedApp}
               onComplete={refetch}
            />
         )}
      </div>
   );
};

export default InspectionSchedulingPage;
