import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileCheck, RotateCcw, TrendingUp } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from "axios"

export default function ModernChartsPage() {
    const [reportData, setReportData] = useState({
        totalUsers: 0,
        applicationsForReview: 0,
        applicationsReturned: 0,
        userGrowth: [],
        applicationTypes: [],
        applicationStatus: [],
        dailyApplications: []
    })
    const [userGrowthFilter, setUserGrowthFilter] = useState('day')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const [usersResponse, applicationsResponse, returnedResponse, userGrowthResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/admin/reports/total-users', {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:3000/api/admin/reports/applications-for-review', {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:3000/api/admin/reports/applications-returned', {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    }),
                    axios.get(`http://localhost:3000/api/admin/reports/user-graph?timeFilter=${userGrowthFilter}`, {
                        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
                    })
                ]);

                // Transform user growth data for Nivo Line chart
                const userGrowthData = userGrowthResponse.data.data || [];

                setReportData(prevData => ({
                    ...prevData,
                    totalUsers: usersResponse.data.totalUsers,
                    applicationsForReview: applicationsResponse.data.applicationsForReview,
                    applicationsReturned: returnedResponse.data.applicationsReturned,
                    userGrowth: userGrowthData.length > 0 ? userGrowthData : [{ date: 'No Data', users: 0 }],
                    // Keep other simulated data for now
                    applicationTypes: [
                        { type: 'Chainsaw Registration', count: 450 },
                        { type: 'Certificate of Registration', count: 300 },
                        { type: 'Private Land Timber Permit', count: 150 },
                        { type: 'Private Land Tree Plantation Registration', count: 100 }
                    ],
                    applicationStatus: [
                        { status: 'Approved', count: 600 },
                        { status: 'Pending', count: 250 },
                        { status: 'Rejected', count: 50 },
                        { status: 'Under Review', count: 100 }
                    ],
                    dailyApplications: [
                        { day: 'Mon', count: 45 },
                        { day: 'Tue', count: 52 },
                        { day: 'Wed', count: 49 },
                        { day: 'Thu', count: 58 },
                        { day: 'Fri', count: 60 },
                        { day: 'Sat', count: 35 },
                        { day: 'Sun', count: 30 },
                    ]
                }))
                setLoading(false)
            } catch (err) {
                console.error('Error fetching report data:', err.response ? err.response.data : err.message);
                setError('Failed to fetch report data. Please try again later.');
                setLoading(false)
            }
        }
        fetchData()
    }, [userGrowthFilter])

    const handleUserGrowthFilterChange = (value) => {
        setUserGrowthFilter(value);
    }

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <h1 className="text-4xl font-bold text-green-700 mb-10 pt-14 pl-4">Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={reportData.totalUsers} icon={<Users className="h-8 w-8 text-green-700" />} />
                <StatCard title="Applications for Review" value={reportData.applicationsForReview} icon={<FileCheck className="h-8 w-8 text-green-700" />} />
                <StatCard title="Applications Returned" value={reportData.applicationsReturned} icon={<RotateCcw className="h-8 w-8 text-green-700" />} />
                <StatCard title="User Growth Rate" value="15%" icon={<TrendingUp className="h-8 w-8 text-green-700" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="User Growth">
                    <div className="mb-4">
                        <Select value={userGrowthFilter} onValueChange={setUserGrowthFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Last 7 Days</SelectItem>
                                <SelectItem value="week">Last 4 Weeks</SelectItem>
                                <SelectItem value="month">Last 6 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reportData.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#15803d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
                <ChartCard title="Application Types">
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.applicationTypes}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#15803d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Application Status Overview">
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.applicationStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#15803d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
                <ChartCard title="Daily Application Submissions">
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.dailyApplications}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#15803d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </div>
    )
}


function StatCard({ title, value, icon }) {
    return (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    {icon}
                    <CardTitle className="text-sm font-medium text-green-700">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-700">{value}</div>
            </CardContent>
        </Card>
    )
}

function ChartCard({ title, children }) {
    return (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-700">{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
                {children}
            </CardContent>
        </Card>
    )
}