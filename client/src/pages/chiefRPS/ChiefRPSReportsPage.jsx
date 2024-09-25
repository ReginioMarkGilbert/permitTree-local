import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Users, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChiefRPSReportsPage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        applicationsForReview: 0,
        approvedToday: 0,
        returnedApplications: 0,
        applicationIncrease: 0
    });
    const [applicationTrend, setApplicationTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                console.log('Token:', token); // Add this line
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                const response = await axios.get('http://localhost:3000/api/chief-rps/reports', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setStats(response.data.stats);
                setApplicationTrend(response.data.applicationTrend);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching report data:', err);
                if (err.response) {
                    console.error('Response data:', err.response.data);
                    console.error('Response status:', err.response.status);
                    console.error('Response headers:', err.response.headers);
                }
                setError('Failed to fetch report data. Please try again later.');
                setLoading(false);
                if (err.response && err.response.status === 401) {
                    console.log('Unauthorized access. Redirecting to login...');
                    // Implement your redirect logic here
                    // window.location.href = '/login';
                }
            }
        };

        fetchReportData();
    }, []);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className='p-8 bg-green-50 min-h-screen'>
            <h1 className='text-3xl font-bold text-green-800 mb-6'>Reports Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-green-800 flex items-center">
                            <Users className="h-6 w-6 mr-2" />
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-yellow-800 flex items-center">
                            <AlertTriangle className="h-6 w-6 mr-2" />
                            Applications for Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-yellow-600">{stats.applicationsForReview}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-blue-800 flex items-center">
                            <CheckCircle className="h-6 w-6 mr-2" />
                            Approved Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">{stats.approvedToday}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-orange-800 flex items-center">
                            <XCircle className="h-6 w-6 mr-2" />
                            Returned Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">{stats.returnedApplications}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-purple-800 flex items-center">
                            <TrendingUp className="h-6 w-6 mr-2" />
                            Application Increase (Last 30 days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-purple-600">{stats.applicationIncrease}%</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white shadow-md">
                <CardHeader>
                    <CardTitle className="text-green-800">Application Trend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={applicationTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="applications" stroke="#059669" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChiefRPSReportsPage;
