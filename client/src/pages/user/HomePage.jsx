import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { FaClipboardList, FaUser, FaBell, FaCheckCircle } from 'react-icons/fa';
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

const HomePage = () => {
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
      { title: "New Application", icon: <FaClipboardList className="h-6 w-6" />, link: "/permits" },
      { title: "My Applications", icon: <FaClipboardList className="h-6 w-6" />, link: "/applicationsStatus" },
      { title: "Notifications", icon: <FaBell className="h-6 w-6" />, link: "/notifications" },
      { title: "Profile", icon: <FaUser className="h-6 w-6" />, link: "/profile" },
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

   const formatDate = (dateString) => {
      const date = new Date(parseInt(dateString));
      const now = new Date();
      const diffInHours = Math.abs(now - date) / 36e5;

      if (diffInHours < 24) {
         return `${Math.round(diffInHours)} hours ago`;
      }
      return date.toLocaleDateString();
   };

   if (userLoading || applicationsLoading) return <p>Loading...</p>;
   if (userError || applicationsError) return <p>Error: {userError?.message || applicationsError?.message}</p>;

   const { firstName, lastName } = userData?.me || {};

   return (
      <div className="min-h-screen bg-green-50 flex flex-col pt-16">
         <ToastContainer />
         <main className="container mx-auto py-8 flex-grow mt-4">
            <h1 className="text-3xl font-bold text-green-800 mb-6">
               {isNewUser ? "Welcome" : "Welcome back"}, {firstName}!
            </h1>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               {quickActions.map((action, index) => (
                  <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                           <div className="text-green-600">{action.icon}</div>
                           <CardTitle className="text-sm font-medium text-green-800">{action.title}</CardTitle>
                        </div>
                     </CardHeader>
                     <CardContent>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => window.location.href = action.link}>
                           Go to {action.title}
                        </Button>
                     </CardContent>
                  </Card>
               ))}
            </div>

            {/* Recent Applications and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Recent Applications */}
               <Card className="lg:col-span-2 bg-white recent-applications-card group">
                  <CardHeader>
                     <CardTitle className="text-green-800">Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="relative flex flex-col h-full">
                     {applicationsLoading ? (
                        <p className="text-center text-gray-500">Loading applications...</p>
                     ) : applicationsError ? (
                        <p className="text-center text-red-500">{applicationsError.message}</p>
                     ) : recentApplications.length === 0 ? (
                        <div className="h-[365px] flex items-center justify-center">
                           <p className="text-gray-500">No recent applications</p>
                        </div>
                     ) : (
                        <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar applications-container group-hover:scrollbar-visible">
                           {recentApplications.slice(0, 7).map((app, index) => (
                              <div key={index} className="flex items-center border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                 <div className="flex-grow pr-4">
                                    <p className="font-semibold text-green-800">{app.applicationType}</p>
                                    <p className="text-sm text-gray-500">Application ID: {app.applicationNumber}</p>
                                    <p className="text-sm text-gray-500">Submitted: {new Date(parseInt(app.dateOfSubmission)).toLocaleDateString()}</p>
                                 </div>
                                 <div className="flex-shrink-0 w-24 text-right mr-4">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                                       {app.status}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </CardContent>
                  <CardFooter>
                     <Button
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.location.href = '/applicationsStatus'}
                     >
                        View All Applications
                     </Button>
                  </CardFooter>
               </Card>

               {/* Notifications */}
               <Card className="bg-white notifications-card group">
                  <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle className="text-green-800">Recent Notifications</CardTitle>
                     {unreadNotifications.length > 0 && (
                        <Button
                           onClick={markAllAsRead}
                           className="text-sm text-green-600 hover:text-green-700"
                           variant="ghost"
                        >
                           Mark all as read
                        </Button>
                     )}
                  </CardHeader>
                  <CardContent className="relative flex flex-col h-full">
                     {notificationsLoading ? (
                        <p className="text-center text-gray-500">Loading notifications...</p>
                     ) : notificationsError ? (
                        <p className="text-center text-red-500">{notificationsError.message}</p>
                     ) : notifications.length === 0 ? (
                        <div className="h-[365px] flex items-center justify-center">
                           <p className="text-gray-500">No notifications</p>
                        </div>
                     ) : (
                        <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar notifications-container group-hover:scrollbar-visible">
                           {notifications.slice(0, 10).map((notification) => (
                              <div
                                 key={notification.id}
                                 className={`flex items-start border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 ${
                                    !notification.read ? 'bg-green-50' : ''
                                 }`}
                              >
                                 <div className="flex-grow pr-4">
                                    <div className="flex items-center justify-between">
                                       <p className="font-semibold text-green-800">
                                          {formatNotificationType(notification.type)}
                                       </p>
                                       {!notification.read && (
                                          <Button
                                             onClick={() => markAsRead(notification.id)}
                                             className="text-sm text-green-600 hover:text-green-700 p-1"
                                             variant="ghost"
                                          >
                                             <FaCheckCircle className="h-4 w-4" />
                                          </Button>
                                       )}
                                    </div>
                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                       {formatDate(notification.createdAt)}
                                    </p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </CardContent>
                  <CardFooter>
                     <Button
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.location.href = '/notifications'}
                     >
                        View All Notifications
                     </Button>
                  </CardFooter>
               </Card>
            </div>
         </main>
         <HomeFooter />
      </div>
   );
};

export default HomePage;
