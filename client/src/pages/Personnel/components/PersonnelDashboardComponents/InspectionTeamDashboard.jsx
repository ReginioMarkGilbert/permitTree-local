import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from 'lucide-react';
import { gql, useQuery } from '@apollo/client';

const GET_INSPECTION_APPLICATIONS = gql`
  query GetInspectionApplications($status: String!) {
    getInspectionApplications(status: $status) {
      id
      customId
      applicationType
      requestType
      name
      address
      contactNumber
      dateOfSubmission
      status
      # inspectionSchedule
      # inspectionFindings
      # location
    }
  }
`;

const InspectionTeamDashboard = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('Applications for Inspection');

   const tabs = ['Applications for Inspection', 'Completed Inspections'];

   const { loading: pendingLoading, data: pendingData } = useQuery(GET_INSPECTION_APPLICATIONS, {
      variables: { status: 'For Inspection' },
   });

   const { loading: completedLoading, data: completedData } = useQuery(GET_INSPECTION_APPLICATIONS, {
      variables: { status: 'Inspection Completed' },
   });

   const handleSearch = (applications) => {
      if (!searchTerm) return applications;
      return applications?.filter(app =>
         app.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
   };

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case 'for inspection': return 'bg-yellow-100 text-yellow-800';
         case 'inspection completed': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const renderTabDescription = () => {
      if (activeTab === 'Applications for Inspection') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications that need to be inspected.</h1>
            </div>
         );
      }
      if (activeTab === 'Completed Inspections') {
         return (
            <div className="mb-4 -mt-4">
               <h1 className="text-sm text-green-800">This is the list of applications with completed inspections.</h1>
            </div>
         );
      }
   };

   const renderTable = () => {
      const applications = activeTab === 'Applications for Inspection'
         ? pendingData?.getInspectionApplications
         : completedData?.getInspectionApplications;
      const isLoading = activeTab === 'Applications for Inspection' ? pendingLoading : completedLoading;

      if (isLoading) {
         return <p className="text-center text-gray-500">Loading applications...</p>;
      }

      if (!applications?.length) {
         return <p className="text-center text-gray-500">No applications found.</p>;
      }

      const filteredApplications = handleSearch(applications);

      return (
         <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICATION NUMBER</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPLICANT NAME</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                     <tr key={app.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{app.customId}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{app.applicantName}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm text-gray-900">
                              {new Date(app.dateOfSubmission).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{app.location}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                              {app.status}
                           </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="flex space-x-2">
                              {activeTab === 'Applications for Inspection' ? (
                                 <>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleScheduleInspection(app.id)}
                                    >
                                       Schedule
                                    </Button>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleSubmitFindings(app.id)}
                                    >
                                       Submit Findings
                                    </Button>
                                 </>
                              ) : (
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewFindings(app.id)}
                                 >
                                    View Findings
                                 </Button>
                              )}
                           </div>
                        </td>
                     </tr>
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
               <h1 className="text-3xl font-bold text-green-800">Inspection Team Dashboard</h1>
               <Button onClick={() => { }} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
               </Button>
            </div>

            <div className="mb-6 overflow-x-auto">
               <div className="bg-gray-100 p-1 rounded-md inline-flex whitespace-nowrap">
                  {tabs.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${activeTab === tab ? 'bg-white text-green-800 shadow' : 'text-black hover:bg-gray-200'
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            {renderTabDescription()}

            <div className="mb-6">
               <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded-md p-2 w-full"
               />
            </div>

            {renderTable()}
         </div>
      </div>
   );
};

export default InspectionTeamDashboard;
