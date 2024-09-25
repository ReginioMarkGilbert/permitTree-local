import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { Bell, ClipboardList, Users, Settings, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { FaChartLine } from 'react-icons/fa';
import '../../components/ui/styles/customScrollBar.css';

const AdminHomePage = () => {
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // State for dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        applicationsForReview: 56,  // Mock data
        approvedToday: 23,  // Mock data
        returnedApplications: 5,  // Mock data
        applicationIncrease: 12  // Mock data
    });

    const quickActions = [
        { title: "Reports", icon: <FaChartLine className="h-6 w-6" />, link: "/chief-rps/reports" },
        { title: "All Applications", icon: <ClipboardList className="h-6 w-6" />, link: "/chief-rps/applications" },
        { title: "System Settings", icon: <Settings className="h-6 w-6" />, link: "/chief-rps/settings" },
        { title: "Notifications", icon: <Bell className="h-6 w-6" />, link: "/chief-rps/notifications" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // console.log('Token:', token);
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                const response = await axios.get('http://localhost:3000/api/admin/reports/total-users', {
                    headers: {
                        Authorization: token
                    }
                });

                // console.log('Total users response:', response.data);

                setDashboardStats(prevStats => ({
                    ...prevStats,
                    totalUsers: response.data.totalUsers,
                }));

                // Fetch all applications (for recent applications display)
                const applicationsResponse = await axios.get('http://localhost:3000/api/admin/all-applications', {
                    headers: {
                        Authorization: token
                    }
                });

                setRecentApplications(applicationsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err.response ? err.response.data : err.message);
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewAllApplications = () => {
        navigate('/chief-rps/dashboard');
    };

    const handleViewDetailedAnalytics = () => {
        navigate('/chief-rps/reports');
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-6">Admin Dashboard</h1>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickActions.map((action, index) => (
                    <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">{action.title}</CardTitle>
                            <div className="text-green-600">{action.icon}</div>
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
                                        <div>
                                            <p className="font-semibold text-green-800">{app.applicationType}</p>
                                            <p className="text-sm text-gray-500">ID: {app.customId}</p>
                                            <p className="text-sm text-gray-500">Date: {new Date(app.dateOfSubmission).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-right mr-4"> {/* Spacing for status */}
                                            <span className={`px-2 py-1 rounded-full text-xs ${app.status === "Approved" ? "bg-green-200 text-green-800" :
                                                app.status === "Submitted" ? "bg-yellow-200 text-yellow-800" :
                                                    app.status === "In Progress" ? "bg-blue-200 text-blue-800" :
                                                        app.status === "Accepted" ? "bg-green-200 text-green-800" :
                                                            app.status === "Released" ? "bg-green-200 text-green-800" :
                                                                app.status === "Expired" ? "bg-red-200 text-red-800" :
                                                                    app.status === "Rejected" ? "bg-red-200 text-red-800" :
                                                                        app.status === "Returned" ? "bg-orange-200 text-orange-800" :
                                                                            "bg-red-200 text-red-800"
                                                }`}>
                                                {app.status === "Submitted" ? "For Review" : app.status} {/* Change this line */}
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
                                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
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
                                        <XCircle className="h-6 w-6 text-orange-600" />
                                        <span className="text-2xl font-bold text-orange-800">{dashboardStats.returnedApplications}</span>
                                    </div>
                                    <p className="text-sm text-orange-600 mt-2">Returned Applications</p>
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
