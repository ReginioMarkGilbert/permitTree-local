import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { Bell, ClipboardList, Users, Settings, TrendingUp, CheckCircle, XCircle, ClipboardCheck, RotateCcw } from "lucide-react";
import { FaChartLine } from 'react-icons/fa';
import '../../components/ui/styles/customScrollBar.css';
import { useChiefRPSNotification } from './contexts/ChiefRPSNotificationContext';
import useDebounce from '../../hooks/useDebounce';

const AdminHomePage = () => {
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { unreadCount } = useChiefRPSNotification();
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

    const quickActions = [
        { title: "Reports", icon: <FaChartLine className="h-6 w-6" />, link: "/chief-rps/reports" },
        { title: "All Applications", icon: <ClipboardList className="h-6 w-6" />, link: "/chief-rps/dashboard" },
        { title: "System Settings", icon: <Settings className="h-6 w-6" />, link: "/chief-rps/settings" },
        {
            title: "Notifications",
            icon: (
                <div className="relative">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 left-3 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            {unreadCount}
                        </span>
                    )}
                </div>
            ),
            link: "/chief-rps/notifications"
        },
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
        navigate('/chief-rps/dashboard');
    };

    const handleViewDetailedAnalytics = () => {
        navigate('/chief-rps/reports');
    };

    // Function to trigger a refresh
    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col p-8 pt-24">
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
                <Card className="lg:col-span-2 bg-white recent-applications-card">
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
        </div>
    );
};

export default AdminHomePage;
