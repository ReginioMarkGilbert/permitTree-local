import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Bell, ClipboardList, Users, Settings, TrendingUp, CheckCircle, XCircle, ClipboardCheck, RotateCcw, Info, AlertCircle, AlertTriangle } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import HomeFooter from '../../components/ui/HomeFooter';
import '../../components/ui/styles/customScrollBar.css';
import { gql, useQuery } from '@apollo/client';
import { useRecentApplications } from './hooks/useUserRecentApplications';
import { useUserNotifications } from './hooks/useUserNotifications';

const GET_USER_DETAILS = gql`
  query GetUserDetails {
    me {
      firstName
      lastName
    }
  }
`;

const HomePage = ({ sidebarOpen }) => {
   const { recentApplications, loading: applicationsLoading, error: applicationsError } = useRecentApplications();
   const {
      notifications,
      unreadNotifications,
      loading: notificationsLoading,
      error: notificationsError,
      markAsRead,
      markAllAsRead
   } = useUserNotifications();
   const [recentNotifications, setRecentNotifications] = useState([]);
   const [unreadCount, setUnreadCount] = useState(0);

   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const isNewUser = queryParams.get('newUser') === 'true';

   const { loading: userLoading, error: userError, data: userData } = useQuery(GET_USER_DETAILS);

   const quickActions = useMemo(() => [
      { title: "New Application", icon: <ClipboardList className="h-6 w-6" />, link: "/permits" },
      { title: "My Applications", icon: <ClipboardList className="h-6 w-6" />, link: "/applicationsStatus" },
      { title: "Notifications", icon: <Bell className="h-6 w-6" />, link: "/notifications" },
      { title: "Profile", icon: <Users className="h-6 w-6" />, link: "/profile" },
   ], []);

   const getStatusColor = useCallback((status) => {
      switch (status.toLowerCase()) {
         case 'draft':
            return 'bg-gray-200 text-gray-800';
         case 'submitted':
            return 'bg-blue-200 text-blue-800';
         case 'in progress':
            return 'bg-yellow-200 text-yellow-800';
         case 'approved':
            return 'bg-green-200 text-green-800';
         case 'rejected':
            return 'bg-red-200 text-red-800';
         case 'returned':
            return 'bg-orange-200 text-orange-800';
         case 'expired':
            return 'bg-purple-200 text-purple-800';
         default:
            return 'bg-gray-200 text-gray-800';
      }
   }, []);

   const formatNotificationType = (type) => {
      switch (type) {
         case 'APPLICATION_STATUS':
            return 'Application Update';
         case 'SYSTEM':
            return 'System Notice';
         case 'PAYMENT':
            return 'Payment Update';
         default:
            return 'Notification';
      }
   };

   const formatDate = (timestamp) => {
      // const date = new Date(timestamp);
      // return date.toLocaleDateString();
      return new Date(timestamp).toLocaleDateString();
   };

   if (userLoading || applicationsLoading) return <p>Loading...</p>;
   if (userError || applicationsError) return <p>Error: {userError?.message || applicationsError?.message}</p>;

   const { firstName, lastName } = userData?.me || {};

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col pt-16">
         <ToastContainer />
         <main className={`flex-grow transition-all duration-300 mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8 py-8
            ${sidebarOpen ? 'lg:ml-64' : ''}`}
         >
            <div className="max-w-[85rem] mx-auto">
               {/* Welcome Section */}
               <div className="text-center mb-8 sm:mb-12">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                     {isNewUser ? "Welcome" : "Welcome back"}, {firstName}!
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600">
                     Manage your environmental permits and applications all in one place.
                  </p>
               </div>

               {/* Quick Actions */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
                  {quickActions.map((action, index) => (
                     <Card
                        key={index}
                        className="group bg-white rounded-xl shadow-md hover:shadow-xl
                           transition-all duration-300 overflow-hidden"
                     >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-green-50 text-green-600
                                 group-hover:bg-green-100 transition-colors duration-300">
                                 {action.icon}
                              </div>
                              <CardTitle className="text-base font-semibold text-gray-900">
                                 {action.title}
                              </CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                           <Button
                              className="w-full bg-gradient-to-r from-green-600 to-green-700
                                 hover:from-green-700 hover:to-green-800 text-white
                                 transform transition-all duration-300
                                 hover:translate-y-[-2px] active:translate-y-0
                                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                              onClick={() => window.location.href = action.link}
                           >
                              Go to {action.title}
                           </Button>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {/* Main Content Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
                  {/* Recent Applications Card - reduce span */}
                  <Card className="lg:col-span-7 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                     <CardHeader className="border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                           <div className="p-2 rounded-lg bg-green-50 text-green-600">
                              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
                           </div>
                           <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                              Recent Applications
                           </CardTitle>
                        </div>
                     </CardHeader>
                     <CardContent className="relative flex flex-col h-full pt-4 sm:pt-6">
                        {/* Content height adjustments */}
                        <div className="h-[300px] sm:h-[365px] overflow-y-auto custom-scrollbar pr-2 sm:pr-4">
                           {applicationsLoading ? (
                              <div className="flex items-center justify-center h-[365px]">
                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                              </div>
                           ) : applicationsError ? (
                              <div className="flex items-center justify-center h-[365px] text-red-500">
                                 <AlertCircle className="h-6 w-6 mr-2" />
                                 <p>Error loading applications</p>
                              </div>
                           ) : recentApplications.length === 0 ? (
                              <div className="h-[365px] flex flex-col items-center justify-center text-gray-500">
                                 <ClipboardList className="h-12 w-12 mb-3 text-gray-400" />
                                 <p className="text-lg">No recent applications</p>
                                 <p className="text-sm mt-2">Start by creating a new application</p>
                              </div>
                           ) : (
                              <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar pr-4">
                                 {recentApplications.slice(0, 7).map((app, index) => (
                                    <div
                                       key={index}
                                       className="group flex items-center border-b border-gray-100 pb-4 last:border-b-0
                                          hover:bg-gray-50 rounded-lg transition-all duration-200 -mx-2 px-4"
                                    >
                                       <div className="flex-grow">
                                          <p className="font-semibold text-gray-900 group-hover:text-green-700
                                             transition-colors duration-200">
                                             {app.applicationType}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                             <p className="text-sm text-gray-500">ID: {app.applicationNumber}</p>
                                             <span className="text-gray-300">•</span>
                                             <p className="text-sm text-gray-500">
                                                {formatDate(app.dateOfSubmission)}
                                             </p>
                                          </div>
                                       </div>
                                       <div className="flex-shrink-0">
                                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                                             ${getStatusColor(app.status)}`}>
                                             {app.status}
                                          </span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </CardContent>
                     <CardFooter className="border-t border-gray-100 pt-4">
                        <Button
                           className="w-full bg-gradient-to-r from-green-600 to-green-700
                              hover:from-green-700 hover:to-green-800 text-white
                              transform transition-all duration-300
                              hover:translate-y-[-2px] active:translate-y-0
                              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                           onClick={() => window.location.href = '/applicationsStatus'}
                        >
                           View All Applications
                        </Button>
                     </CardFooter>
                  </Card>

                  {/* Notifications Card - increase span */}
                  <Card className="lg:col-span-5 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                     <CardHeader className="flex flex-row items-center justify-between
                        border-b border-gray-100 pb-3 sm:pb-4">
                        <div className="flex items-center space-x-3">
                           <div className="p-2 rounded-lg bg-green-50 text-green-600 relative">
                              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                              {unreadNotifications.length > 0 && (
                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white
                                    text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px]
                                    h-5 flex items-center justify-center">
                                    {unreadNotifications.length}
                                 </span>
                              )}
                           </div>
                           <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                              Notifications
                           </CardTitle>
                        </div>
                     </CardHeader>
                     <CardContent className="relative flex flex-col h-full pt-4 sm:pt-6">
                        {/* Content height adjustments */}
                        <div className="h-[250px] sm:h-[21.5rem] overflow-y-auto custom-scrollbar pr-2 sm:pr-4">
                           {notificationsLoading ? (
                              <div className="flex items-center justify-center h-[21.5rem]">
                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                              </div>
                           ) : notificationsError ? (
                              <div className="flex items-center justify-center h-[21.5rem] text-red-500">
                                 <AlertCircle className="h-6 w-6 mr-2" />
                                 <p>Error loading notifications</p>
                              </div>
                           ) : notifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-[21.5rem] text-gray-500">
                                 <Bell className="h-12 w-12 mb-3 text-gray-400" />
                                 <p className="text-lg">No notifications yet</p>
                                 <p className="text-sm mt-2">We'll notify you of important updates</p>
                              </div>
                           ) : (
                              <div className="space-y-3 h-[21.5rem] overflow-y-auto custom-scrollbar pr-4">
                                 {notifications.slice(0, 10).map((notification) => (
                                    <div
                                       key={notification.id}
                                       onClick={() => markAsRead(notification.id)}
                                       className={`group relative rounded-lg p-4 transition-all duration-200
                                          cursor-pointer transform hover:translate-x-1
                                          ${!notification.read
                                             ? 'bg-green-50 hover:bg-green-100'
                                             : 'bg-gray-50 hover:bg-gray-100'
                                          }`}
                                    >
                                       <div className="flex items-start gap-3">
                                          <div className="flex-shrink-0">
                                             {notification.type === 'APPLICATION_STATUS' ? (
                                                <ClipboardList className="h-5 w-5 text-blue-500" />
                                             ) : notification.type === 'PAYMENT' ? (
                                                <TrendingUp className="h-5 w-5 text-green-500" />
                                             ) : (
                                                <Info className="h-5 w-5 text-green-500" />
                                             )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700
                                                transition-colors duration-200">
                                                {notification.title}
                                             </p>
                                             <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                             </p>
                                             <p className="text-xs text-gray-500 mt-2">
                                                {formatDate(notification.createdAt)}
                                             </p>
                                          </div>
                                          {!notification.read && (
                                             <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-green-500"></div>
                                          )}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </CardContent>
                     <CardFooter className="border-t border-gray-100 pt-4">
                        <Button
                           className="w-full bg-gradient-to-r from-green-600 to-green-700
                              hover:from-green-700 hover:to-green-800 text-white
                              transform transition-all duration-300
                              hover:translate-y-[-2px] active:translate-y-0
                              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                           onClick={() => window.location.href = '/notifications'}
                        >
                           View All Notifications
                        </Button>
                     </CardFooter>
                  </Card>
               </div>
            </div>
         </main>
         <HomeFooter />
      </div>
   );
};

export default HomePage;
