import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { Bell, ClipboardList, Users, Settings, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const AdminHomePage = () => {
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const quickActions = [
        { title: "Manage Users", icon: <Users className="h-6 w-6" />, link: "/admin/users" },
        { title: "All Applications", icon: <ClipboardList className="h-6 w-6" />, link: "/admin/applications" },
        { title: "System Settings", icon: <Settings className="h-6 w-6" />, link: "/admin/settings" },
        { title: "Notifications", icon: <Bell className="h-6 w-6" />, link: "/admin/notifications" },
    ];

    useEffect(() => {
        // Simulating API call to fetch recent applications
        setTimeout(() => {
            setRecentApplications([
                { id: "PMDQ-CSAW-2024-0920-00011", type: "Chainsaw Registration", status: "Pending", date: "9/20/2024" },
                { id: "PMDQ-CSAW-2024-0920-00013", type: "Chainsaw Registration", status: "Approved", date: "9/20/2024" },
                { id: "PMDQ-CSAW-2024-0920-00014", type: "Chainsaw Registration", status: "Returned", date: "9/20/2024" },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen bg-green-50 flex flex-col p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickActions.map((action, index) => (
                    <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">{action.title}</CardTitle>
                            <div className="text-green-600">{action.icon}</div>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Go to {action.title}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white">
                    <CardHeader>
                        <CardTitle className="text-green-800">Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading applications...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : (
                            <div className="space-y-4">
                                {recentApplications.map((app, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-b-0">
                                        <div>
                                            <p className="font-semibold text-green-800">{app.type}</p>
                                            <p className="text-sm text-gray-500">ID: {app.id}</p>
                                            <p className="text-sm text-gray-500">Date: {app.date}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${app.status === "Approved" ? "bg-green-200 text-green-800" :
                                                app.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                                                    "bg-red-200 text-red-800"
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">View All Applications</Button>
                    </CardFooter>
                </Card>
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
                                        <span className="text-2xl font-bold text-green-800">1,234</span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-2">Total Users</p>
                                </div>
                                <div className="bg-yellow-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                        <span className="text-2xl font-bold text-yellow-800">56</span>
                                    </div>
                                    <p className="text-sm text-yellow-600 mt-2">Applications for Review</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <CheckCircle className="h-6 w-6 text-blue-600" />
                                        <span className="text-2xl font-bold text-blue-800">23</span>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-2">Approved Today</p>
                                </div>
                                <div className="bg-orange-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <XCircle className="h-6 w-6 text-orange-600" />
                                        <span className="text-2xl font-bold text-orange-800">5</span>
                                    </div>
                                    <p className="text-sm text-orange-600 mt-2">Returned Applications</p>
                                </div>
                            </div>
                            <div className="bg-purple-100 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                    <span className="text-2xl font-bold text-purple-800">12%</span>
                                </div>
                                <p className="text-sm text-purple-600 mt-2">Application Increase (Last 30 days)</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">View Detailed Analytics</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default AdminHomePage;
