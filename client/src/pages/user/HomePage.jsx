import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FaLeaf, FaBars, FaTimes, FaHome, FaClipboardList, FaBell, FaUser } from 'react-icons/fa';

export default function HomePage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const user = {
        name: "Juan Dela Cruz",
        avatar: "/placeholder.svg?height=40&width=40",
    };

    const quickActions = [
        { title: "New Application", icon: <FaClipboardList className="h-6 w-6" />, link: "/permits" },
        { title: "My Applications", icon: <FaClipboardList className="h-6 w-6" />, link: "/applicationsStatus" },
        { title: "Notifications", icon: <FaBell className="h-6 w-6" />, link: "/notifications" },
        { title: "Profile", icon: <FaUser className="h-6 w-6" />, link: "/profile" },
    ];

    const recentApplications = [
        { id: "APP-001", type: "Chainsaw Registration", status: "Pending", date: "2023-05-15" },
        { id: "APP-002", type: "Tree Cutting Permit", status: "Approved", date: "2023-05-10" },
        { id: "APP-003", type: "Private Tree Plantation Registration", status: "Under Review", date: "2023-05-05" },
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

    return (
        <div className="min-h-screen bg-green-50 flex flex-col pt-16">

            <main className="flex-grow p-8">
                <h1 className="text-3xl font-bold text-green-800 mb-6">Welcome back, {user.name}!</h1>

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
                    <Card className="lg:col-span-2 bg-white">
                        <CardHeader>
                            <CardTitle className="text-green-800">Recent Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentApplications.map((app, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                        <div>
                                            <p className="font-semibold text-green-800">{app.type}</p>
                                            <p className="text-sm text-gray-500">Application ID: {app.id}</p>
                                            <p className="text-sm text-gray-500">Submitted: {app.date}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${app.status === "Approved" ? "bg-green-200 text-green-800" :
                                            app.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                                                "bg-blue-200 text-blue-800"
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                                View All Applications
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle className="text-green-800">Important Announcements</CardTitle>
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

            <footer className="bg-green-800 text-white py-4">
                <div className="container mx-auto px-4 text-center text-sm">
                    <p>&copy; 2023 PermitTree - DENR-PENRO. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
