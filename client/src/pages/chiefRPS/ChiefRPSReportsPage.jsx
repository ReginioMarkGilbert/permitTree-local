import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Users } from "lucide-react";

function ChiefRPSReportsPage() {
    const [totalUsers, setTotalUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                // console.log('Token:', token);
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get('http://localhost:3000/api/admin/reports/total-users', {
                    headers: {
                        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                    }
                });
                setTotalUsers(response.data.totalUsers);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching total users:', err.response ? err.response.data : err.message);
                setError('Failed to fetch total users. Please try again later.');
                setLoading(false);
            }
        };

        fetchTotalUsers();
    }, []);

    return (
        <div className='flex flex-col items-center justify-start min-h-screen bg-green-50 p-8'>
            <h1 className="text-3xl font-bold text-green-800 mb-6">Chief RPS Reports</h1>

            <div className="w-full max-w-md">
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
                                <span className="text-3xl font-bold text-green-800">{totalUsers}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ChiefRPSReportsPage;
