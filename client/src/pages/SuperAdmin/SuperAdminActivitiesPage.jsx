import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   LogIn,
   LogOut,
   UserCog,
   KeyRound,
   FileText,
   CreditCard,
   Upload,
   UserPlus,
   FileCheck,
   Mail,
   Settings,
   Activity,
   Search,
   Calendar,
   Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, gql } from '@apollo/client';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
   Pagination,
   PaginationContent,
   PaginationEllipsis,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from "@/components/ui/pagination"

const GET_ALL_ACTIVITIES = gql`
  query GetAllActivities($filter: ActivityFilterInput, $page: Int, $limit: Int) {
    allActivities(filter: $filter, page: $page, limit: $limit) {
      activities {
        id
        type
        username
        timestamp
        description
        metadata {
          deviceType
          ip
          userType
          specificRole
          applicationId {
            applicationNumber
            applicationType
          }
          amount
        }
      }
      pagination {
        total
        currentPage
        totalPages
      }
    }
  }
`;

const activityTypes = [
   { value: 'ALL_TYPES', label: 'All Types' },
   { value: 'LOGIN', label: 'Login' },
   { value: 'LOGOUT', label: 'Logout' },
   { value: 'PROFILE_UPDATE', label: 'Profile Update' },
   { value: 'PASSWORD_CHANGE', label: 'Password Change' },
   { value: 'APPLICATION_SUBMIT', label: 'Application Submit' },
   { value: 'PAYMENT_MADE', label: 'Payment Made' },
   { value: 'DOCUMENT_UPLOAD', label: 'Document Upload' },
   { value: 'ACCOUNT_CREATED', label: 'Account Created' },
   { value: 'PERMIT_RECEIVED', label: 'Permit Received' },
   { value: 'EMAIL_VERIFIED', label: 'Email Verified' },
   { value: 'SETTINGS_UPDATED', label: 'Settings Updated' }
];

const ActivityItem = ({ activity }) => {
   const getActivityIcon = (type) => {
      const icons = {
         LOGIN: LogIn,
         LOGOUT: LogOut,
         PROFILE_UPDATE: UserCog,
         PASSWORD_CHANGE: KeyRound,
         APPLICATION_SUBMIT: FileText,
         PAYMENT_MADE: CreditCard,
         DOCUMENT_UPLOAD: Upload,
         ACCOUNT_CREATED: UserPlus,
         PERMIT_RECEIVED: FileCheck,
         EMAIL_VERIFIED: Mail,
         SETTINGS_UPDATED: Settings
      };
      return icons[type] || Activity;
   };

   const getActivityColor = (type) => {
      const colors = {
         LOGIN: 'text-green-500',
         LOGOUT: 'text-orange-500',
         PROFILE_UPDATE: 'text-blue-500',
         PASSWORD_CHANGE: 'text-yellow-500',
         APPLICATION_SUBMIT: 'text-purple-500',
         PAYMENT_MADE: 'text-emerald-500',
         DOCUMENT_UPLOAD: 'text-cyan-500',
         ACCOUNT_CREATED: 'text-indigo-500',
         PERMIT_RECEIVED: 'text-teal-500',
         EMAIL_VERIFIED: 'text-sky-500',
         SETTINGS_UPDATED: 'text-violet-500'
      };
      return colors[type] || 'text-gray-500';
   };

   const Icon = getActivityIcon(activity.type);
   const colorClass = getActivityColor(activity.type);
   const formattedDate = format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a');

   return ( // list item
      <Card className="p-4 transition-all bg-white/50 dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-gray-900 backdrop-blur-sm">
         <div className="flex items-start gap-4">
            <div className={`p-2 bg-background/50 dark:bg-gray-900/50 rounded-full ${colorClass}`}>
               <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between">
                  <div>
                     <p className="font-medium text-gray-900 dark:text-white">
                        {activity.username}
                     </p>
                     <p className="text-sm text-muted-foreground dark:text-gray-300">
                        {activity.description}
                     </p>
                  </div>
                  <span className="text-sm text-muted-foreground dark:text-gray-400 whitespace-nowrap ml-4">
                     {formattedDate}
                  </span>
               </div>
               <div className="mt-2 flex flex-wrap gap-2">
                  {activity.metadata?.deviceType && (
                     <span className="text-xs bg-secondary/50 dark:bg-gray-700 px-2 py-1 rounded-full dark:text-gray-200">
                        {activity.metadata.deviceType}
                     </span>
                  )}
                  {activity.metadata?.ip && (
                     <span className="text-xs bg-secondary/50 dark:bg-gray-700 px-2 py-1 rounded-full dark:text-gray-200">
                        IP: {activity.metadata.ip}
                     </span>
                  )}
                  {activity.metadata?.applicationId && (
                     <span className="text-xs bg-primary/10 dark:bg-primary/50 px-2 py-1 rounded-full dark:text-primary-foreground">
                        {activity.metadata.applicationId.applicationNumber}
                     </span>
                  )}
                  {activity.metadata?.amount && (
                     <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                        ₱{activity.metadata.amount.toLocaleString()}
                     </span>
                  )}
               </div>
            </div>
         </div>
      </Card>
   );
};

const SuperAdminActivitiesPage = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedType, setSelectedType] = useState('ALL_TYPES');
   const [dateRange, setDateRange] = useState({ from: null, to: null });
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   // Browser detection
   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const { loading, error, data, refetch } = useQuery(GET_ALL_ACTIVITIES, {
      variables: {
         filter: {
            searchTerm,
            type: selectedType === 'ALL_TYPES' ? null : selectedType,
            dateFrom: dateRange.from,
            dateTo: dateRange.to
         },
         page: currentPage,
         limit: itemsPerPage
      }
   });

   const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
   };

   const handleSearch = (e) => {
      e.preventDefault();
      setCurrentPage(1); // Reset to first page on new search
      refetch();
   };

   const handleReset = () => {
      setSearchTerm('');
      setSelectedType('ALL_TYPES');
      setDateRange({ from: null, to: null });
      setCurrentPage(1);
      refetch({
         filter: {
            searchTerm: '',
            type: null,
            dateFrom: null,
            dateTo: null
         },
         page: 1,
         limit: itemsPerPage
      });
   };

   const SelectComponent = () => {
      if (isChrome) {
         return (
            <select
               value={selectedType}
               onChange={(e) => {
                  setSelectedType(e.target.value);
                  refetch();
               }}
               className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background/50 dark:bg-gray-900/50 text-sm"
            >
               {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                     {type.label}
                  </option>
               ))}
            </select>
         );
      }

      return (
         <Select
            value={selectedType}
            onValueChange={(value) => {
               setSelectedType(value);
               refetch();
            }}
         >
            <SelectTrigger className="w-full bg-background/50 dark:bg-gray-900/50">
               <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
               {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                     {type.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 pt-20 pb-6 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-4 pt-6">
            <Card className="border-none shadow-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm">
               <CardHeader className="py-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Activity Log</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-300">View and filter all system activities</CardDescription>
               </CardHeader>
               <CardContent className="py-2">
                  <div className="pb-2 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                     <div className="flex items-center space-x-2 md:col-span-2">
                        <Search className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
                        <Input
                           placeholder="Search by username..."
                           value={searchTerm}
                           onChange={(e) => {
                              setSearchTerm(e.target.value);
                              refetch();
                           }}
                           className="flex-1 bg-background/50 dark:bg-gray-900/50"
                        />
                     </div>
                     <div>
                        <SelectComponent />
                     </div>
                     <div>
                        <DateRangePicker
                           value={dateRange}
                           onChange={(range) => {
                              setDateRange(range || { from: null, to: null });
                              setCurrentPage(1);
                              refetch();
                           }}
                        />
                     </div>
                     <div className="flex justify-end">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={handleReset}
                           className="w-full md:w-auto bg-background/50 dark:bg-gray-900/50 hover:bg-background/80 dark:hover:bg-gray-800/80"
                        >
                           Reset Filters
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm">
               <CardContent className="pt-4">
                  <div className="h-[600px] overflow-hidden flex flex-col">
                     {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                           <div className="text-center">
                              <Activity className="w-6 h-6 mx-auto animate-spin text-primary dark:text-white" />
                              <p className="mt-2 text-sm text-muted-foreground dark:text-gray-300">Loading activities...</p>
                           </div>
                        </div>
                     ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                           <Card className="p-6 text-center text-red-500 dark:bg-gray-700">
                              <p className="text-sm">Error loading activities: {error.message}</p>
                           </Card>
                        </div>
                     ) : (
                        <>
                           <div className="space-y-3 overflow-y-auto custom-scrollbar pr-4 flex-1">
                              {data?.allActivities.activities.map((activity) => (
                                 <ActivityItem key={activity.id} activity={activity} />
                              ))}
                              {data?.allActivities.activities.length === 0 && (
                                 <div className="text-center py-6 text-muted-foreground dark:text-gray-400">
                                    <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No activities found</p>
                                 </div>
                              )}
                           </div>
                           {data?.allActivities.pagination.totalPages > 1 && (
                              <div className="py-3 border-t dark:border-gray-700">
                                 <Pagination>
                                    <PaginationContent>
                                       <PaginationItem>
                                          <PaginationPrevious
                                             onClick={() => handlePageChange(currentPage - 1)}
                                             disabled={currentPage === 1}
                                             className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                                          />
                                       </PaginationItem>

                                       {[...Array(data.allActivities.pagination.totalPages)].map((_, i) => {
                                          const pageNumber = i + 1;
                                          if (
                                             pageNumber === 1 ||
                                             pageNumber === data.allActivities.pagination.totalPages ||
                                             (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                          ) {
                                             return (
                                                <PaginationItem key={pageNumber}>
                                                   <PaginationLink
                                                      onClick={() => handlePageChange(pageNumber)}
                                                      isActive={currentPage === pageNumber}
                                                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                                                   >
                                                      {pageNumber}
                                                   </PaginationLink>
                                                </PaginationItem>
                                             );
                                          } else if (
                                             pageNumber === currentPage - 2 ||
                                             pageNumber === currentPage + 2
                                          ) {
                                             return (
                                                <PaginationItem key={pageNumber}>
                                                   <PaginationEllipsis className="dark:text-gray-400" />
                                                </PaginationItem>
                                             );
                                          }
                                          return null;
                                       })}

                                       <PaginationItem>
                                          <PaginationNext
                                             onClick={() => handlePageChange(currentPage + 1)}
                                             disabled={currentPage === data.allActivities.pagination.totalPages}
                                             className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                                          />
                                       </PaginationItem>
                                    </PaginationContent>
                                 </Pagination>
                              </div>
                           )}
                        </>
                     )}
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
};

export default SuperAdminActivitiesPage;
