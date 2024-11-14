import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { Bell, ClipboardList, Users, Settings, TrendingUp, CheckCircle, XCircle, ClipboardCheck, RotateCcw, Info, AlertCircle, AlertTriangle } from "lucide-react";
import { FaChartLine } from 'react-icons/fa';
import '../../components/ui/styles/customScrollBar.css';
import useDebounce from '../../hooks/useDebounce';
import { getUserRoles } from '../../utils/auth';
import { usePersonnelNotifications } from './hooks/usePersonnelNotifications';

const PersonnelHomePage = () => {
   const [recentApplications, setRecentApplications] = useState([]);
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

   //  #region - temporarily comment out til converted to graphql
   //  const fetchData = useCallback(async () => {
   //      setLoading(true);
   //      try {
   //          const token = localStorage.getItem('token');
   //          if (!token) {
   //              throw new Error('No authentication token found.');
   //          }

   //          const [totalUsersResponse, applicationsForReviewResponse, applicationsReturnedResponse] = await Promise.all([
   //              axios.get('http://localhost:3000/api/admin/reports/total-users', {
   //                  headers: { Authorization: token }
   //              }),
   //              axios.get('http://localhost:3000/api/admin/reports/applications-for-review', {
   //                  headers: { Authorization: token }
   //              }),
   //              axios.get('http://localhost:3000/api/admin/reports/applications-returned', {
   //                  headers: { Authorization: token }
   //              })
   //          ]);

   //          setDashboardStats(prevStats => ({
   //              ...prevStats,
   //              totalUsers: totalUsersResponse.data.totalUsers,
   //              applicationsForReview: applicationsForReviewResponse.data.applicationsForReview,
   //              applicationsReturned: applicationsReturnedResponse.data.applicationsReturned
   //          }));

   //          // Fetch all applications (for recent applications display)
   //          const applicationsResponse = await axios.get('http://localhost:3000/api/admin/all-applications', {
   //              headers: { Authorization: token },
   //              params: { excludeDrafts: true }
   //          });

   //          // Filter out draft applications on the client side as well
   //          const nonDraftApplications = applicationsResponse.data.filter(app => app.status !== 'Draft');
   //          setRecentApplications(nonDraftApplications);

   //          setLoading(false);
   //      } catch (err) {
   //          console.error('Error fetching data:', err.response ? err.response.data : err.message);
   //          setError('Failed to fetch data. Please try again later.');
   //          setLoading(false);
   //      }
   //  }, []);

   //  useEffect(() => {
   //      fetchData();
   //  }, [debouncedRefreshTrigger, fetchData]);

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

   return (
      <div className="min-h-screen bg-green-50 flex flex-col pt-16">
         <main className="container mx-auto py-8 flex-grow mt-4">
            {renderRole()}
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
                        <Button
                           className="w-full bg-green-600 hover:bg-green-700 text-white"
                           onClick={() => navigate(action.link)}>
                           Go to {action.title}
                        </Button>
                     </CardContent>
                  </Card>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Recent Applications Card */}
               <Card className="bg-white recent-applications-card">
                  <CardHeader>
                     <CardTitle className="text-green-800">Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {loading ? (
                        <p className="text-center text-gray-500">Loading applications...</p>
                     ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                     ) : (
                        <div className="space-y-4 h-[21.5rem] overflow-y-auto custom-scrollbar"> {/* Increased height to h-96 */}
                           {recentApplications.slice(0, 7).map((app, index) => (
                              <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-b-0">
                                 <div className="flex-grow mr-4">
                                    <p className="font-semibold text-green-800">{app.applicationType}</p>
                                    <p className="text-sm text-gray-500">ID: {app.customId}</p>
                                    <p className="text-sm text-gray-500">Date: {new Date(app.dateOfSubmission).toLocaleDateString()}</p>
                                 </div>
                                 <div className="flex-shrink-0 text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${app.status === "Approved" ? "bg-green-200 text-green-800" :
                                       app.status === "Submitted" ? "bg-yellow-200 text-yellow-800" :
                                          app.status === "In Progress" ? "bg-blue-200 text-blue-800" :
                                             app.status === "Accepted" ? "bg-green-200 text-green-800" :
                                                app.status === "Released" ? "bg-green-200 text-green-800" :
                                                   app.status === "Expired" ? "bg-red-200 text-red-800" :
                                                      app.status === "Rejected" ? "bg-red-200 text-red-800" :
                                                         app.status === "Returned" ? "bg-orange-200 text-orange-800" :
                                                            app.status === "Payment Proof Submitted" ? "bg-purple-200 text-purple-800" :
                                                               "bg-gray-200 text-gray-800"
                                       }`}>
                                       {app.status === "Submitted" ? "For Review" : app.status}
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
                        onClick={handleViewAllApplications}
                     >
                        View All Applications
                     </Button>
                  </CardFooter>
               </Card>

               {/* Recent Notifications Card */}
               <Card className="bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-green-800 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Recent Notifications
                     </CardTitle>
                     {notifications.length > 0 && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                           {notifications.length} new
                        </span>
                     )}
                  </CardHeader>
                  <CardContent>
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
                                 className={`group relative rounded-lg p-4 transition-all duration-200 ${
                                    !notification.read
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
                                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                                             notification.priority === 'high'
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
                  </CardContent>
                  <CardFooter>
                     <Button
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => navigate('/personnel/notifications')}
                     >
                        View All Notifications
                     </Button>
                  </CardFooter>
               </Card>

               {/* Quick Stats Card */}
               <Card className="bg-white">
                  <CardHeader>
                     <CardTitle className="text-green-800">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  <CardFooter>
                     <Button
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleViewDetailedAnalytics}
                     >
                        View Detailed Analytics
                     </Button>
                  </CardFooter>
               </Card>
            </div>
         </main>
      </div>
   );
};

export default PersonnelHomePage;
