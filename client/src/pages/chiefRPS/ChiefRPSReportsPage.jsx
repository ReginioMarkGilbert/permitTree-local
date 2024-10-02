import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileCheck, RotateCcw, TrendingUp } from "lucide-react"
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar } from '@nivo/bar'
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
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <Select value={userGrowthFilter} onValueChange={handleUserGrowthFilterChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-grow" style={{ height: '300px' }}>
                            {loading ? (
                                <p>Loading...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : reportData.userGrowth.length > 0 ? (
                                <ResponsiveLine
                                    data={[
                                        {
                                            id: "User Growth",
                                            data: reportData.userGrowth.map(item => ({
                                                x: item.date,
                                                y: item.users
                                            }))
                                        }
                                    ]}
                                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                                    xScale={{ type: 'point' }}
                                    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                                    yFormat=" >-.0f"
                                    axisTop={null}
                                    axisRight={null}
                                    axisBottom={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: -45,
                                        legend: 'Date',
                                        legendOffset: 36,
                                        legendPosition: 'middle'
                                    }}
                                    axisLeft={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: 'Users',
                                        legendOffset: -40,
                                        legendPosition: 'middle'
                                    }}
                                    pointSize={10}
                                    pointColor={{ theme: 'background' }}
                                    pointBorderWidth={2}
                                    pointBorderColor={{ from: 'serieColor' }}
                                    pointLabelYOffset={-12}
                                    useMesh={true}
                                    colors={['#15803d']}
                                    theme={{
                                        axis: {
                                            ticks: { text: { fill: '#15803d' } },
                                            legend: { text: { fill: '#15803d' } }
                                        },
                                        grid: { line: { stroke: '#dcfce7' } }
                                    }}
                                    tooltip={({ point }) => (
                                        <div className="bg-white p-2 shadow rounded">
                                            <strong>Date:</strong> {point.data.xFormatted}<br />
                                            <strong>Users:</strong> {point.data.yFormatted}
                                        </div>
                                    )}
                                />
                            ) : (
                                <p>No data available</p>
                            )}
                        </div>
                    </div>
                </ChartCard>
                <ChartCard title="Application Types">
                    <div style={{ height: '300px' }}>
                        <ResponsiveBar
                            data={reportData.applicationTypes}
                            keys={['count']}
                            indexBy="type"
                            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                            padding={0.3}
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={['#15803d']}
                            theme={{
                                axis: {
                                    ticks: { text: { fill: '#15803d' } },
                                    legend: { text: { fill: '#15803d' } }
                                },
                                grid: { line: { stroke: '#dcfce7' } }
                            }}
                            axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Application Type', legendPosition: 'middle', legendOffset: 32 }}
                            axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Count', legendPosition: 'middle', legendOffset: -40 }}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor="#ffffff"
                        />
                    </div>
                </ChartCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Application Status Overview">
                    <div style={{ height: '300px' }}>
                        <ResponsiveBar
                            data={reportData.applicationStatus}
                            keys={['count']}
                            indexBy="status"
                            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                            padding={0.3}
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={['#15803d', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']}
                            theme={{
                                axis: { ticks: { text: { fill: '#15803d' } }, legend: { text: { fill: '#15803d' } } },
                                grid: { line: { stroke: '#dcfce7' } }
                            }}
                            defs={[
                                { id: 'dots', type: 'patternDots', background: 'inherit', color: '#22c55e', size: 4, padding: 1, stagger: true },
                                { id: 'lines', type: 'patternLines', background: 'inherit', color: '#22c55e', rotation: -45, lineWidth: 6, spacing: 10 }
                            ]}
                            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Status', legendPosition: 'middle', legendOffset: 32 }}
                            axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Count', legendPosition: 'middle', legendOffset: -40 }}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor="#ffffff"
                            legends={[{
                                dataFrom: 'keys', anchor: 'bottom-right', direction: 'column', justify: false, translateX: 120, translateY: 0, itemsSpacing: 2, itemWidth: 100, itemHeight: 20, itemDirection: 'left-to-right', itemOpacity: 0.85, symbolSize: 20,
                                effects: [{ on: 'hover', style: { itemOpacity: 1 } }]
                            }
                            ]}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={15}
                        />
                    </div>
                </ChartCard>
                <ChartCard title="Daily Applications (Last Week)">
                    <div style={{ height: '300px' }}>
                        <ResponsiveBar
                            data={reportData.dailyApplications}
                            keys={['count']}
                            indexBy="day"
                            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                            padding={0.3}
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={['#15803d']} // green-700
                            theme={{
                                axis: { ticks: { text: { fill: '#15803d' } }, legend: { text: { fill: '#15803d' } } },
                                grid: { line: { stroke: '#dcfce7' } }
                            }}
                            defs={[
                                { id: 'dots', type: 'patternDots', background: 'inherit', color: '#22c55e', size: 4, padding: 1, stagger: true },
                                { id: 'lines', type: 'patternLines', background: 'inherit', color: '#22c55e', rotation: -45, lineWidth: 6, spacing: 10 }
                            ]}
                            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Day', legendPosition: 'middle', legendOffset: 32 }}
                            axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Applications', legendPosition: 'middle', legendOffset: -40 }}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor="#ffffff"
                            legends={[
                                {
                                    dataFrom: 'keys', anchor: 'bottom-right', direction: 'column', justify: false, translateX: 120, translateY: 0, itemsSpacing: 2, itemWidth: 100, itemHeight: 20, itemDirection: 'left-to-right', itemOpacity: 0.85, symbolSize: 20,
                                    effects: [
                                        {
                                            on: 'hover',
                                            style: {
                                                itemOpacity: 1
                                            }
                                        }
                                    ]
                                }
                            ]}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={15}
                        />
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
