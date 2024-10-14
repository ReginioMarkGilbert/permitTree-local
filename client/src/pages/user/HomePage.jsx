import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { FaLeaf, FaBars, FaTimes, FaHome, FaClipboardList, FaBell, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import HomeFooter from '../../components/ui/HomeFooter';
import '../../components/ui/styles/customScrollBar.css';
import { useNotification } from './contexts/UserNotificationContext';

const formatNotificationType = (type) => {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const HomePage = () => {
    console.log('Rendering HomePage');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({ firstName: '', lastName: '' });
    const { unreadCount } = useNotification();
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [notificationsError, setNotificationsError] = useState(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isNewUser = queryParams.get('newUser') === 'true';

    const quickActions = useMemo(() => [
        { title: "New Application", icon: <FaClipboardList className="h-6 w-6" />, link: "/permits" },
        { title: "My Applications", icon: <FaClipboardList className="h-6 w-6" />, link: "/applicationsStatus" },
        {
            title: "Notifications",
            icon: (
                <div className="relative">
                    <FaBell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {unreadCount}
                        </span>
                    )}
                </div>
            ),
            link: "/notifications"
        },
        { title: "Profile", icon: <FaUser className="h-6 w-6" />, link: "/profile" },
    ], [unreadCount]);

    const sidebarLinks = useMemo(() => [
        { title: "Dashboard", icon: <FaHome className="h-5 w-5" />, link: "/" },
        { title: "My Applications", icon: <FaClipboardList className="h-5 w-5" />, link: "/applications" },
        { title: "Notifications", icon: <FaBell className="h-5 w-5" />, link: "/notifications" },
        { title: "Profile", icon: <FaUser className="h-5 w-5" />, link: "/profile" },
    ], []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const fetchRecentApplications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }
            const response = await axios.get('http://localhost:3000/api/getAllApplications', {
                params: {
                    status: ['Submitted', 'Returned', 'Accepted', 'Released', 'Expired', 'Rejected']
                },
                headers: {
                    'Authorization': token
                }
            });
            setRecentApplications(response.data);
            setLoading(false);
        } catch (err) {
            console.log('Error fetching recent applications:', err);
            setError('Failed to fetch recent applications.');
            setLoading(false);
        }
    }, []);

    const fetchUserDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/user-details', {
                headers: {
                    Authorization: token
                }
            });
            setUser(response.data.user);
        } catch (err) {
            console.error('Error fetching user details:', err);
            toast.error('Failed to fetch user details.');
        }
    }, []);

    const fetchRecentNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }
            const response = await axios.get('http://localhost:3000/api/user/notifications', {
                headers: {
                    'Authorization': token
                },
                params: {
                    limit: 7
                }
            });
            setRecentNotifications(response.data);
            setNotificationsLoading(false);
        } catch (err) {
            console.error('Error fetching recent notifications:', err);
            setNotificationsError('Failed to fetch recent notifications.');
            setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecentApplications();
        fetchUserDetails();
        fetchRecentNotifications();
    }, [fetchRecentApplications, fetchUserDetails, fetchRecentNotifications]);

    const getStatusColor = useCallback((status) => {
        switch (status.toLowerCase()) {
            case 'submitted':
                return 'bg-blue-200 text-blue-800';
            case 'accepted':
                return 'bg-green-200 text-green-800';
            case 'returned':
                return 'bg-red-200 text-red-800';
            case 'released':
                return 'bg-purple-200 text-purple-800';
            case 'expired':
                return 'bg-gray-200 text-gray-800';
            case 'rejected':
                return 'bg-red-200 text-red-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    }, []);

    return (
        <div className="min-h-screen bg-green-50 flex flex-col pt-16">
            <ToastContainer />
            <main className="flex-grow p-8">
                <h1 className="text-3xl font-bold text-green-800 mb-6">
                    {isNewUser ? "Welcome" : "Welcome back"}, {user.firstName} {user.lastName}!
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
                            {loading ? (
                                <p className="text-center text-gray-500">Loading applications...</p>
                            ) : error ? (
                                <p className="text-center text-red-500">{error}</p>
                            ) : recentApplications.length === 0 ? (
                                <div className="flex-grow flex items-center justify-center">  {/* Centering the message */}
                                    <p className="text-gray-500 pt-12">No recent applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar applications-container group-hover:scrollbar-visible">
                                    {recentApplications.slice(0, 7).map((app, index) => (
                                        <div key={index} className="flex items-center border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                            <div className="flex-grow pr-4">
                                                <p className="font-semibold text-green-800">{app.applicationType}</p>
                                                <p className="text-sm text-gray-500">Application ID: {app.customId}</p>
                                                <p className="text-sm text-gray-500">Submitted: {new Date(app.dateOfSubmission).toLocaleDateString()}</p>
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
                        <CardHeader>
                            <CardTitle className="text-green-800 flex items-center justify-between">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                                        {unreadCount} new
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative flex flex-col h-full">
                            {notificationsLoading ? (
                                <p className="text-center text-gray-500">Loading notifications...</p>
                            ) : notificationsError ? (
                                <p className="text-center text-red-500">{notificationsError}</p>
                            ) : recentNotifications.length === 0 ? (
                                <p className="text-center text-gray-500">No recent notifications</p>
                            ) : (
                                <div className="space-y-4 h-[365px] overflow-y-auto custom-scrollbar notifications-container group-hover:scrollbar-visible">
                                    {recentNotifications.map((notification, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 mb-2 last:mb-0 border-l-4 ${notification.read
                                                ? 'bg-white border-gray-300'
                                                : 'bg-green-100 border-green-500'
                                                }`}
                                        >
                                            <p className={`font-semibold ${notification.read ? 'text-gray-800' : 'text-green-800'}`}>
                                                {formatNotificationType(notification.type)}
                                            </p>
                                            <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-green-700'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </p>
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

export default React.memo(HomePage);
