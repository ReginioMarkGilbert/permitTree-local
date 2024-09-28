import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Users, AlertTriangle, RotateCcw } from "lucide-react";

function ChiefRPSReportsPage() {
    const [reportData, setReportData] = useState({
        totalUsers: null,
        applicationsForReview: null,
        applicationsReturned: null  // New state for returned applications
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const [usersResponse, applicationsResponse, returnedResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/admin/reports/total-users', {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:3000/api/admin/reports/applications-for-review', {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:3000/api/admin/reports/applications-returned', {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    })
                ]);

                setReportData({
                    totalUsers: usersResponse.data.totalUsers,
                    applicationsForReview: applicationsResponse.data.applicationsForReview,
                    applicationsReturned: returnedResponse.data.applicationsReturned
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching report data:', err.response ? err.response.data : err.message);
                setError('Failed to fetch report data. Please try again later.');
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    return (
        <div className='flex flex-col items-center justify-start min-h-screen bg-green-50 p-28'>
            {/* <h1 className="text-3xl font-bold text-green-800 mb-6">Chief RPS Reports</h1> */}

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-green-800">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : (
                            <div className="flex items-center justify-between">
                                <Users className="h-8 w-8 text-green-600" />
                                <span className="text-3xl font-bold text-green-800">{reportData.totalUsers}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-yellow-800">Applications for Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : (
                            <div className="flex items-center justify-between">
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                                <span className="text-3xl font-bold text-yellow-800">{reportData.applicationsForReview}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-orange-800">Applications Returned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : (
                            <div className="flex items-center justify-between">
                                <RotateCcw className="h-8 w-8 text-orange-600" />
                                <span className="text-3xl font-bold text-orange-800">{reportData.applicationsReturned}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ChiefRPSReportsPage;
