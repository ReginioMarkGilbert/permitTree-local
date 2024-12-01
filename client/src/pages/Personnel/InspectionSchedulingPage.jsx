import React, { useState, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { FileX, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import InspectionApplicationRow from './components/InspectionDashboardComponents/InspectionApplicationRow';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ApplicationFilters from '@/components/DashboardFilters/ApplicationFilters';
import { useTypewriter } from '@/hooks/useTypewriter';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import InspectionEventModal from './components/InspectionDashboardComponents/InspectionEventModal';
import { Button } from "@/components/ui/button";
import { useApplications } from './hooks/useApplications';

const GET_INSPECTIONS = gql`
  query GetInspections {
    getInspections {
      id
      permitId
      applicationNumber
      applicationType
      scheduledDate
      scheduledTime
      location
      inspectionStatus
      findings {
        result
        observations
        recommendations
        attachments {
          filename
          contentType
          data
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const InspectionSchedulingPage = () => {
   const [filters, setFilters] = useState({
      searchTerm: '',
      applicationType: '',
      dateRange: {
         from: undefined,
         to: undefined
      }
   });
   const [activeMainTab, setActiveMainTab] = useState('For Schedule');
   const [view, setView] = useState('table');
   const [selectedEvent, setSelectedEvent] = useState(null);
   const [viewMode, setViewMode] = useState('dashboard');
   const isMobile = useMediaQuery('(max-width: 640px)');

   const { applications, loading: appLoading, refetch: refetchApps } = useApplications({
      currentStage: activeMainTab === 'For Schedule' ? 'ForInspectionByTechnicalStaff' : undefined,
      hasInspectionReport: activeMainTab === 'Completed Inspection' ? true : undefined
   });

   const { data: inspectionData, loading: inspLoading, error: inspError, refetch: refetchInsp } = useQuery(GET_INSPECTIONS);

   const loading = appLoading || inspLoading;
   const error = inspError;

   const refetch = () => {
      refetchApps();
      refetchInsp();
   };

   const mainTabs = ['For Schedule', 'Scheduled Inspection', 'Completed Inspection'];

   const getInspectionStatus = useMemo(() => (applicationId) => {
      if (!inspectionData?.getInspections) return null;
      return inspectionData.getInspections.find(insp => insp.permitId === applicationId);
   }, [inspectionData?.getInspections]);

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
      console.log('Raw applications:', applications);

      return applications.filter(app => {
         console.log('Filtering application:', app);
         const inspection = getInspectionStatus(app.id);

         switch (activeMainTab) {
            case 'For Schedule':
               return !inspection || inspection.inspectionStatus === 'Cancelled';

            case 'Scheduled Inspection':
               return inspection?.inspectionStatus === 'Pending' ||
                      inspection?.inspectionStatus === 'Rescheduled';

            case 'Completed Inspection':
               return inspection?.inspectionStatus === 'Completed';

            default:
               return true;
         }
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
   }, [applications, inspectionData, activeMainTab, filters, getInspectionStatus]);

   const descriptions = {
      'For Schedule': 'This is the list of applications that need to be scheduled for inspection.',
      'Scheduled Inspection': 'This is the list of applications with pending inspections.',
      'Completed Inspection': 'This is the list of applications with completed inspections.'
   };

   const currentDescription = descriptions[activeMainTab] || '';
   const typewriterText = useTypewriter(currentDescription);

   const renderTabDescription = () => {
      return (
         <div className="mb-4 -mt-4">
            <h1 className="text-sm min-h-[20px] text-black dark:text-gray-300">
               {typewriterText}
            </h1>
         </div>
      );
   };

   const calendarEvents = useMemo(() => {
      if (!inspectionData?.getInspections) return [];

      return inspectionData.getInspections
         .filter(inspection => inspection.inspectionStatus === 'Pending')
         .map(inspection => {
            const dateObj = new Date(inspection.scheduledDate);
            const eventDate = dateObj.toISOString().split('T')[0];
            const eventTime = inspection.scheduledTime.padStart(5, '0');

            return {
               id: inspection.id,
               title: `${inspection.applicationNumber}`,
               start: `${eventDate}T${eventTime}:00`,
               end: `${eventDate}T${eventTime}:00`,
               location: inspection.location,
               extendedProps: {
                  applicationType: inspection.applicationType,
                  applicationNumber: inspection.applicationNumber,
                  location: inspection.location
               },
               classNames: ['inspection-event']
            };
         });
   }, [inspectionData]);

   const handleEventClick = (clickInfo) => {
      setSelectedEvent(clickInfo.event);
   };

   const renderDashboardContent = () => {
      if (filteredApplications.length === 0) {
         return (
            <div className="text-center py-8">
               <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
               <h3 className="mt-2 text-sm font-medium text-foreground">No applications found</h3>
               <p className="mt-1 text-sm text-muted-foreground">
                  No applications available for inspection at this time
               </p>
            </div>
         );
      }

      if (isMobile) {
         return (
            <div className="space-y-4">
               {filteredApplications.map((app) => (
                  <InspectionApplicationRow
                     key={app.id}
                     application={app}
                     inspection={getInspectionStatus(app.id)}
                     formatInspectionStatus={formatInspectionStatus}
                     isScheduleDisabled={isScheduleDisabled}
                     isMobile={true}
                     onRefetch={refetch}
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
                  <TableHead>Type</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Inspection Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredApplications.map((app) => (
                  <InspectionApplicationRow
                     key={app.id}
                     application={app}
                     inspection={getInspectionStatus(app.id)}
                     formatInspectionStatus={formatInspectionStatus}
                     isScheduleDisabled={isScheduleDisabled}
                     isMobile={false}
                     onRefetch={refetch}
                  />
               ))}
            </TableBody>
         </Table>
      );
   };

   const renderContent = () => {
      if (loading) return <div className="text-center">Loading applications...</div>;
      if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

      if (viewMode === 'calendar') {
         return (
            <div className="space-y-4">
               <div className="h-[700px] bg-background rounded-lg shadow p-4">
                  <FullCalendar
                     plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                     initialView="timeGridWeek"
                     headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                     }}
                     events={calendarEvents}
                     eventClick={handleEventClick}
                     slotMinTime="06:00:00"
                     slotMaxTime="18:00:00"
                     allDaySlot={false}
                     height="100%"
                     eventColor="#2563eb"
                     eventClassNames="cursor-pointer"
                     slotLabelFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short'
                     }}
                     nowIndicator={true}
                     scrollTime={`${new Date().getHours()}:00:00`}
                     eventTimeFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short'
                     }}
                     dayHeaderFormat={{
                        weekday: 'short',
                        month: 'numeric',
                        day: 'numeric',
                        omitCommas: true
                     }}
                     eventContent={(eventInfo) => (
                        <div className="p-1">
                           <div className="font-medium text-xs">
                              {eventInfo.event.title}
                           </div>
                           <div className="text-xs opacity-75">
                              {eventInfo.event.extendedProps.applicationType}
                           </div>
                        </div>
                     )}
                  />
               </div>
               <InspectionEventModal
                  isOpen={!!selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                  event={selectedEvent}
               />
            </div>
         );
      }

      return renderDashboardContent();
   };

   return (
      <DashboardLayout
         title="Inspection Management"
         description="Schedule and manage inspections for permit applications"
         onRefresh={refetch}
         isMobile={isMobile}
         mainTabs={viewMode === 'dashboard' ? mainTabs : null}
         activeMainTab={viewMode === 'dashboard' ? activeMainTab : null}
         onMainTabChange={viewMode === 'dashboard' ? setActiveMainTab : null}
         tabDescription={viewMode === 'dashboard' ? renderTabDescription() : null}
         filters={viewMode === 'dashboard' && <ApplicationFilters filters={filters} setFilters={setFilters} />}
      >
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <Button
                  variant={viewMode === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setViewMode('dashboard')}
                  className="flex items-center gap-2"
               >
                  <LayoutGrid className="h-4 w-4" />
                  <span>List View</span>
               </Button>
               <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  onClick={() => setViewMode('calendar')}
                  className="flex items-center gap-2"
               >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Calendar View</span>
               </Button>
            </div>
         </div>
         {renderContent()}
      </DashboardLayout>
   );
};

export default InspectionSchedulingPage;
