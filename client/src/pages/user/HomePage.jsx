import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { FaLeaf, FaBars, FaTimes, FaHome, FaClipboardList, FaBell, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import HomeFooter from '../../components/ui/HomeFooter';
import '../../components/ui/styles/customScrollBar.css';
import { useNotification } from './contexts/UserNotificationContext';

const HomePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({ firstName: '', lastName: '' });
    const { unreadCount } = useNotification();

    const location = useLocation();  // Use location to get the query parameter
    const queryParams = new URLSearchParams(location.search);
    const isNewUser = queryParams.get('newUser') === 'true';  // Check if the user is new

    const quickActions = [
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
    ];

    const sidebarLinks = [
        { title: "Dashboard", icon: <FaHome className="h-5 w-5" />, link: "/" },
        { title: "My Applications", icon: <FaClipboardList className="h-5 w-5" />, link: "/applications" },
        { title: "Notifications", icon: <FaBell className="h-5 w-5" />, link: "/notifications" },
        { title: "Profile", icon: <FaUser className="h-5 w-5" />, link: "/profile" },
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    useEffect(() => {
        fetchRecentApplications();
        fetchUserDetails();
    }, []);

    const fetchRecentApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }
            const response = await axios.get('http://localhost:3000/api/csaw_getApplications', {
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
    };

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token'); // Get the token from local storage
            const response = await axios.get('http://localhost:3000/api/user-details', {
                headers: {
                    Authorization: token // Include the token in the headers
                }
            });
            setUser(response.data.user);
        } catch (err) {
            console.error('Error fetching user details:', err);
            toast.error('Failed to fetch user details.');
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col pt-16">
            <ToastContainer />
            <main className="flex-grow p-8">
                <h1 className="text-3xl font-bold text-green-800 mb-6">
                    {isNewUser ? "Welcome" : "Welcome back"}, {user.firstName} {user.lastName}!
                </h1>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-white recent-applications-card">
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
                                <div className="space-y-4 h-64 overflow-y-auto custom-scrollbar applications-container">
                                    {recentApplications.slice(0, 5).map((app, index) => (
                                        <div key={index} className="flex items-center border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                            <div className="flex-grow pr-4">
                                                <p className="font-semibold text-green-800">{app.applicationType}</p>
                                                <p className="text-sm text-gray-500">Application ID: {app.customId}</p>
                                                <p className="text-sm text-gray-500">Submitted: {new Date(app.dateOfSubmission).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex-shrink-0 w-24 text-right mr-4">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${app.status === "Approved" ? "bg-green-200 text-green-800" :
                                                    app.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                                                        "bg-blue-200 text-blue-800"
                                                    }`}>
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
                    <Card className="bg-white">
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
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-green-100 border-l-4 border-green-500 p-4">
                                    <p className="font-semibold text-green-800">System Maintenance</p>
                                    <p className="text-sm text-green-700">PermitTree will be undergoing maintenance on June 1, 2023, from 10 PM to 2 AM.</p>
                                </div>
                                <div className="bg-green-100 border-l-4 border-green-500 p-4">
                                    <p className="font-semibold text-green-800">New Regulation Update</p>
                                    <p className="text-sm text-green-700">Updated guidelines for Chainsaw Registration will be effective starting July 1, 2023.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <HomeFooter />
        </div>
    );
}

export default HomePage;
