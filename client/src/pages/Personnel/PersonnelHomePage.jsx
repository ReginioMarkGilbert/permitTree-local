import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Bell, ClipboardList, Users, Settings, TrendingUp, CheckCircle, XCircle, ClipboardCheck, RotateCcw, Info, AlertCircle, AlertTriangle } from "lucide-react";
import { FaChartLine } from 'react-icons/fa';
import '@/components/ui/styles/customScrollBar.css';
import useDebounce from '../../hooks/useDebounce';
import { getUserRoles } from '../../utils/auth';
import { usePersonnelNotifications } from './hooks/usePersonnelNotifications';
import { useRecentApplications } from './hooks/useRecentApplications';
import { useOrderOfPayments } from './hooks/useOrderOfPayments';
import { format } from 'date-fns';

const PersonnelHomePage = () => {
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const navigate = useNavigate();
   const [refreshTrigger, setRefreshTrigger] = useState(0);
   const debouncedRefreshTrigger = useDebounce(refreshTrigger, 300);

   // State for dashboard stats
   const [dashboardStats, setDashboardStats] = useState({
      totalUsers: 0,
      applicationsForReview: 0,
      approvedToday: 23,
      applicationsReturned: 0,
      applicationIncrease: 12
   });

   const {
      notifications,
      loading: notificationsLoading,
      error: notificationsError,
      markAsRead
   } = usePersonnelNotifications();

   const quickActions = [
      { title: "Reports", icon: <FaChartLine className="h-6 w-6" />, link: "/personnel/reports" },
      { title: "All Applications", icon: <ClipboardList className="h-6 w-6" />, link: "/personnel/dashboard" },
      { title: "System Settings", icon: <Settings className="h-6 w-6" />, link: "/personnel/settings" },
      { title: "Notifications", icon: <Bell className="h-6 w-6" />, link: "/personnel/notifications" },
   ];


   const handleViewAllApplications = () => {
      const userRoles = getUserRoles();
      if (userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
         navigate("/personnel/receiving-releasing");
      } else if (userRoles.includes('Technical_Staff') || userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
         navigate("/personnel/technical-staff");
      } else if (userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD')) {
         navigate("/personnel/chief");
      } else if (userRoles.includes('Accountant') || userRoles.includes('OOP_Staff_Incharge')) {
         navigate("/personnel/accountant");
      } else if (userRoles.includes('Bill_Collector') || userRoles.includes('Credit_Officer')) {
         navigate("/personnel/bill-collector");
      } else if (userRoles.includes('PENR_CENR_Officer') || userRoles.includes('Deputy_CENR_Officer')) {
         navigate("/personnel/penr-cenr-officer");
      } else if (userRoles.includes('Inspection_Team')) {
         navigate("/personnel/inspection-team");
      } else {
         console.log('No role found');
         navigate("/personnel/dashboard");
      }
   };

   const handleViewDetailedAnalytics = () => {
      navigate('/personnel/reports');
   };

   // Function to trigger a refresh
   const refreshData = () => {
      setRefreshTrigger(prev => prev + 1);
   };

   const userRoles = getUserRoles();

   const renderRole = () => {
      console.log(userRoles);
      if (userRoles.includes('Technical_Staff')) {
         return (
            <div className="">
               <h1>Technical Staff</h1>
            </div>
         )
      }
      if (userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD')) {
         return (
            <div className="">
               <h1>Chief RPS/TSD</h1>
            </div>
         )
      }
      if (userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
         return (
            <div className="">
               <h1>Receiving/Releasing Clerk</h1>
            </div>
         )
      }
      if (userRoles.includes('Bill_Collector') || userRoles.includes('Credit_Officer')) {
         return (
            <div className="">
               <h1>Bill Collector/Credit Officer</h1>
            </div>
         )
      }
      if (userRoles.includes('Accountant') || userRoles.includes('OOP_Staff_Incharge')) {
         return (
            <div className="">
               <h1>Accountant/OOP Staff Incharge</h1>
            </div>
         )
      }
      if (userRoles.includes('PENR_CENR_Officer') || userRoles.includes('Deputy_CENR_Officer')) {
         return (
            <div className="">
               <h1>PENR/CENR Officer</h1>
            </div>
         )
      }
      if (userRoles.includes('Inspection_Team')) {
         return (
            <div className="">
               <h1>Inspection Team</h1>
            </div>
         )
      }
   }

   // Fetch recent applications with a limit of 7
   const {
      recentApplications,
      loading: applicationsLoading,
      error: applicationsError
   } = useRecentApplications(7);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const {
      recentOOPs,
      recentOOPsLoading,
      recentOOPsError
   } = useOrderOfPayments();

   const getGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
         return "Good morning! Ready to process today's applications?";
      } else if (hour >= 12 && hour < 17) {
         return "Good afternoon! Keep up the great work!";
      } else if (hour >= 17 && hour < 22) {
         return "Good evening! Wrapping up for the day?";
      } else {
         return "Working late tonight? Don't forget to rest!";
      }
   };

   const renderRecentApplicationsOrOOPs = () => {
      if (userRoles.includes('Accountant') || userRoles.includes('Bill_Collector')) {
         const status = userRoles.includes('Accountant') ? 'For Approval' : 'Payment Proof Submitted';
         const title = userRoles.includes('Accountant') ? 'Pending Approval' : 'Pending Payment Verification';

         return (
            <Card className="lg:col-span-5 hover:shadow-xl transition-all duration-300 flex flex-col">
               <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 rounded-lg bg-green-50 text-green-600">
                        <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
                     </div>
                     <CardTitle>Recent Order of Payments</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="flex-1 pt-4 sm:pt-6">
                  <div className="h-[300px] sm:h-[365px] overflow-y-auto custom-scrollbar pr-2 sm:pr-4">
                     {recentOOPsLoading ? (
                        <div className="flex items-center justify-center h-[365px]">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                     ) : recentOOPsError ? (
                        <div className="flex flex-col items-center justify-center h-[365px] text-gray-500">
                           <AlertCircle className="h-12 w-12 mb-2 text-red-400" />
                           <p className="text-red-500">Error loading order of payments</p>
                        </div>
                     ) : recentOOPs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[365px] text-gray-500">
                           <ClipboardList className="h-12 w-12 mb-2 text-gray-400" />
                           <p>No pending order of payments</p>
                        </div>
                     ) : (
                        <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar pr-4">
                           {recentOOPs.map((oop) => (
                              <div
                                 key={oop._id}
                                 className="group flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0
                                    hover:bg-gray-50 rounded-lg transition-all duration-200 -mx-2 px-4"
                              >
                                 <div className="flex-grow">
                                    <p className="font-semibold text-gray-900 group-hover:text-green-700
                                       transition-colors duration-200">
                                       {oop.natureOfApplication}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <p className="text-sm text-gray-500">Bill No: {oop.billNo}</p>
                                       <span className="text-gray-300">•</span>
                                       <p className="text-sm text-gray-500">
                                          {formatDate(oop.createdAt)}
                                       </p>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                       Amount: ₱{oop.totalAmount.toLocaleString()}
                                    </p>
                                 </div>
                                 <div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm
                                       ${userRoles.includes('Accountant')
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-blue-100 text-blue-800'
                                       }`}>
                                       {oop.OOPstatus}
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
                     className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                     onClick={() => navigate(userRoles.includes('Accountant')
                        ? '/personnel/accountant'
                        : '/personnel/bill-collector')}
                  >
                     View All Order of Payments
                  </Button>
               </CardFooter>
            </Card>
         );
      }

      return (
         <Card className="lg:col-span-5 hover:shadow-xl transition-all duration-300 flex flex-col">
            <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-50 text-green-600">
                     <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <CardTitle>Recent Applications</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="flex-1 pt-4 sm:pt-6">
               <div className="h-[300px] sm:h-[365px] overflow-y-auto custom-scrollbar pr-2 sm:pr-4">
                  {applicationsLoading ? (
                     <div className="flex items-center justify-center h-[365px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                     </div>
                  ) : applicationsError ? (
                     <div className="flex flex-col items-center justify-center h-[365px] text-gray-500">
                        <AlertCircle className="h-12 w-12 mb-2 text-red-400" />
                        <p className="text-red-500">Error loading applications</p>
                        <p className="text-sm text-gray-400 mt-1">{applicationsError.message}</p>
                     </div>
                  ) : recentApplications.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-[365px] text-gray-500">
                        <ClipboardList className="h-12 w-12 mb-2 text-gray-400" />
                        <p>No applications yet</p>
                     </div>
                  ) : (
                     <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar pr-4">
                        {recentApplications.map((app) => (
                           <div
                              key={app.id}
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
                                       {new Date(app.dateOfSubmission).toLocaleDateString()}
                                    </p>
                                 </div>
                              </div>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${app.status === "Approved" ? "bg-green-100 text-green-800" :
                                 app.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                                    app.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                                       app.status === "Rejected" ? "bg-red-100 text-red-800" :
                                          "bg-gray-100 text-gray-800"
                                 }`}>
                                 {app.status}
                              </span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4">
               <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={handleViewAllApplications}
               >
                  View All Applications
               </Button>
            </CardFooter>
         </Card>
      );
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col pt-16">
         <main className="container mx-auto px-4 py-8 flex-grow max-w-[1600px]">
            <div className="w-full mx-auto">
               {/* Welcome Section */}
               <div className="text-center mb-12">
                  <div className="text-2xl font-semibold text-gray-900 mb-3">
                     {renderRole()}
                  </div>
                  <p className="text-lg text-gray-600">
                     {getGreeting()}
                  </p>
               </div>

               {/* Quick Actions */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {quickActions.map((action, index) => (
                     <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors duration-300">
                                 {action.icon}
                              </div>
                              <CardTitle className="text-base font-semibold text-gray-900">
                                 {action.title}
                              </CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                           <Button
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              onClick={() => navigate(action.link)}
                           >
                              Go to {action.title}
                           </Button>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {renderRecentApplicationsOrOOPs()}

                  {/* Notifications Card */}
                  <Card className="lg:col-span-4 hover:shadow-xl transition-all duration-300 flex flex-col">
                     <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                        <div className="flex items-center space-x-3">
                           <div className="p-2 rounded-lg bg-green-50 text-green-600 relative">
                              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                              {notifications.length > 0 && (
                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                    {notifications.length}
                                 </span>
                              )}
                           </div>
                           <CardTitle>Notifications</CardTitle>
                        </div>
                     </CardHeader>
                     <CardContent className="flex-1 pt-4 sm:pt-6">
                        <div className="h-[300px] sm:h-[365px] overflow-y-auto custom-scrollbar pr-2 sm:pr-4">
                           {notificationsLoading ? (
                              <div className="flex items-center justify-center h-[21.5rem]">
                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                              </div>
                           ) : notificationsError ? (
                              <div className="flex items-center justify-center h-[21.5rem] text-red-500">
                                 <AlertCircle className="h-5 w-5 mr-2" />
                                 Error loading notifications
                              </div>
                           ) : notifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-[21.5rem] text-gray-500">
                                 <Bell className="h-12 w-12 mb-2 text-gray-400" />
                                 <p>No notifications yet</p>
                              </div>
                           ) : (
                              <div className="space-y-3 h-[21.5rem] overflow-y-auto custom-scrollbar pr-2">
                                 {notifications.slice(0, 7).map((notification) => (
                                    <div
                                       key={notification.id}
                                       className={`group relative rounded-lg p-4 transition-all duration-200 ${!notification.read
                                          ? 'bg-green-50 hover:bg-green-100'
                                          : 'bg-gray-50 hover:bg-gray-100'
                                          } cursor-pointer`}
                                       onClick={() => markAsRead(notification.id)}
                                    >
                                       <div className="flex items-start gap-3">
                                          <div className="flex-shrink-0">
                                             {notification.priority === 'high' ? (
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                             ) : notification.priority === 'medium' ? (
                                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                             ) : (
                                                <Info className="h-5 w-5 text-green-500" />
                                             )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-sm font-semibold text-gray-900 mb-1">
                                                {notification.title}
                                             </p>
                                             <p className="text-sm text-gray-600 line-clamp-2">
                                                {notification.message}
                                             </p>
                                             <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500">
                                                   {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                                   {new Date(notification.createdAt).toLocaleTimeString([], {
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                   })}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${notification.priority === 'high'
                                                   ? 'bg-red-100 text-red-800'
                                                   : notification.priority === 'medium'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : 'bg-green-100 text-green-800'
                                                   }`}>
                                                   {notification.priority}
                                                </span>
                                             </div>
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
                           className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                           onClick={() => navigate('/personnel/notifications')}
                        >
                           View All Notifications
                        </Button>
                     </CardFooter>
                  </Card>

                  {/* Quick Stats Card */}
                  <Card className="lg:col-span-3 hover:shadow-xl transition-all duration-300 flex flex-col">
                     <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                        <CardTitle>Quick Stats</CardTitle>
                     </CardHeader>
                     <CardContent className="flex-1 pt-4 sm:pt-6">
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-100 p-4 rounded-lg">
                                 <div className="flex items-center justify-between">
                                    <Users className="h-6 w-6 text-green-600" />
                                    <span className="text-2xl font-bold text-green-800">{dashboardStats.totalUsers}</span>
                                 </div>
                                 <p className="text-sm text-green-600 mt-2">Total Users</p>
                              </div>
                              <div className="bg-yellow-100 p-4 rounded-lg">
                                 <div className="flex items-center justify-between">
                                    <ClipboardCheck className="h-6 w-6 text-yellow-600" />
                                    <span className="text-2xl font-bold text-yellow-800">{dashboardStats.applicationsForReview}</span>
                                 </div>
                                 <p className="text-sm text-yellow-600 mt-2">Applications for Review</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-100 p-4 rounded-lg">
                                 <div className="flex items-center justify-between">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                    <span className="text-2xl font-bold text-blue-800">{dashboardStats.approvedToday}</span>
                                 </div>
                                 <p className="text-sm text-blue-600 mt-2">Approved Today</p>
                              </div>
                              <div className="bg-orange-100 p-4 rounded-lg">
                                 <div className="flex items-center justify-between">
                                    <RotateCcw className="h-6 w-6 text-orange-600" />
                                    <span className="text-2xl font-bold text-orange-800">{dashboardStats.applicationsReturned}</span>
                                 </div>
                                 <p className="text-sm text-orange-600 mt-2">Applications Returned</p>
                              </div>
                           </div>
                           <div className="bg-purple-100 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                 <TrendingUp className="h-6 w-6 text-purple-600" />
                                 <span className="text-2xl font-bold text-purple-800">{dashboardStats.applicationIncrease}%</span>
                              </div>
                              <p className="text-sm text-purple-600 mt-2">Application Increase (Last 30 days)</p>
                           </div>
                        </div>
                     </CardContent>
                     <CardFooter className="border-t border-gray-100 pt-4">
                        <Button
                           className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                           onClick={handleViewDetailedAnalytics}
                        >
                           View Detailed Analytics
                        </Button>
                     </CardFooter>
                  </Card>
               </div>
            </div>
         </main>
      </div>
   );
};

export default PersonnelHomePage;
