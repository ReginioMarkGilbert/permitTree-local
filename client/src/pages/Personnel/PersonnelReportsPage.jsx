import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GET_APPLICATION_ANALYTICS = gql`
    query GetApplicationAnalytics($timeFilter: String!) {
        getApplicationAnalytics(timeFilter: $timeFilter) {
            applicationTypes {
                id
                label
                value
            }
            statusData {
                id
                label
                value
            }
            processingTimeData {
                id
                data {
                    x
                    y
                }
            }
            successRateData {
                month
                success
                rejection
            }
        }
    }
`;

const GET_FINANCIAL_ANALYTICS = gql`
    query GetFinancialAnalytics($timeFilter: String!) {
        getFinancialAnalytics(timeFilter: $timeFilter) {
            revenueStats {
                total
                paid
                pending
                overdue
            }
            monthlyRevenue {
                month
                revenue
                target
            }
            paymentStatus {
                status
                count
                amount
            }
            permitTypeRevenue {
                permitType
                revenue
                count
            }
        }
    }
`;

const mockFinancialData = {
   // Revenue Stats
   revenueStats: {
      total: 34450,
      paid: 23000,
      pending: 7350,
      overdue: 0,
      monthlyGrowth: 12.5
   },

   // Monthly Revenue Trend (6 months)
   monthlyRevenue: [
      { month: 'Jan 2024', revenue: 28500, target: 30000 },
      { month: 'Feb 2024', revenue: 32000, target: 30000 },
      { month: 'Mar 2024', revenue: 29800, target: 30000 },
      { month: 'Apr 2024', revenue: 34450, target: 30000 },
      { month: 'May 2024', revenue: 31200, target: 30000 },
      { month: 'Jun 2024', revenue: 33800, target: 30000 }
   ],

   // Revenue by Permit Type
   permitTypeRevenue: [
      { type: 'Chainsaw Registration', amount: 12500, percentage: 35 },
      { type: 'Tree Cutting Permit', amount: 8900, percentage: 25 },
      { type: 'Earth Balling Permit', amount: 7100, percentage: 20 },
      { type: 'Private Land Timber', amount: 5950, percentage: 20 }
   ],

   // Top Paying Clients
   topPayingClients: [
      { name: 'Green Earth Solutions', total: 8500 },
      { name: 'EcoHarvest Corp', total: 7200 },
      { name: 'Forest Care Inc', total: 6800 },
      { name: 'TreeTech Services', total: 5900 },
      { name: 'Nature Works Ltd', total: 5200 }
   ],

   // Payment Status Distribution
   paymentStatus: [
      { status: 'Paid', count: 68, amount: 23000 },
      { status: 'Pending', count: 25, amount: 7350 },
      { status: 'Overdue', count: 0, amount: 0 }
   ]
};

export default function PersonnelReportsPage() {
    const [timeFilter, setTimeFilter] = useState('week');
    const [activeTab, setActiveTab] = useState('applications');

    const { loading: appLoading, error: appError, data: appData } = useQuery(GET_APPLICATION_ANALYTICS, {
        variables: { timeFilter },
        fetchPolicy: 'network-only'
    });

    const { loading: finLoading, error: finError, data: finData } = useQuery(GET_FINANCIAL_ANALYTICS, {
        variables: { timeFilter },
        fetchPolicy: 'network-only'
    });

    if (appError || finError) {
        return (
            <div className="min-h-screen bg-green-50 p-8 pt-24">
                <div className="text-red-500">Error loading analytics data</div>
            </div>
        );
    }

    if (appLoading || finLoading) {
        return (
            <div className="min-h-screen bg-green-50 p-8 pt-24">
                <Skeleton className="h-8 w-64 mb-10" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] rounded-lg" />
                    <Skeleton className="h-[400px] rounded-lg" />
                    <Skeleton className="h-[400px] rounded-lg" />
                    <Skeleton className="h-[400px] rounded-lg" />
                </div>
            </div>
        );
    }

    const {
        applicationTypes,
        statusData,
        processingTimeData,
        successRateData
    } = appData.getApplicationAnalytics;

    const {
        revenueStats,
        monthlyRevenue,
        paymentStatus,
        permitTypeRevenue
    } = finData.getFinancialAnalytics;

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <div className="max-w-7xl mx-auto pt-24">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-green-700">Analytics Dashboard</h1>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Tabs defaultValue="applications" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="applications">Application Analytics</TabsTrigger>
                        <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="applications">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 shadow-lg">
                                <h2 className="text-xl font-semibold text-green-700 mb-4">Applications by Type</h2>
                                <div className="h-[400px]">
                                    <ResponsivePie
                                        data={applicationTypes}
                                        margin={{ top: 40, right: 80, bottom: 100, left: 80 }}
                                        innerRadius={0.5}
                                        padAngle={0.7}
                                        cornerRadius={3}
                                        activeOuterRadiusOffset={8}
                                        colors={{ scheme: 'nivo' }}
                                        borderWidth={1}
                                        borderColor={{
                                            from: 'color',
                                            modifiers: [['darker', 0.2]]
                                        }}
                                        enableArcLinkLabels={true}
                                        arcLinkLabelsSkipAngle={10}
                                        arcLinkLabelsTextColor="#333333"
                                        arcLabelsSkipAngle={10}
                                        legends={[
                                            {
                                                anchor: 'bottom',
                                                direction: 'row',
                                                justify: false,
                                                translateX: 0,
                                                translateY: 56,
                                                itemsSpacing: 20,
                                                itemWidth: 160,
                                                itemHeight: 18,
                                                itemTextColor: '#999',
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 1,
                                                symbolSize: 18,
                                                symbolShape: 'circle',
                                                effects: [
                                                    {
                                                        on: 'hover',
                                                        style: {
                                                            itemTextColor: '#000'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]}
                                    />
                                </div>
                            </Card>

                            <Card className="p-6 shadow-lg">
                                <h2 className="text-xl font-semibold text-green-700 mb-4">Application Status Distribution</h2>
                                <div className="h-[400px]">
                                    <ResponsivePie
                                        data={statusData}
                                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                                        innerRadius={0.5}
                                        padAngle={0.7}
                                        cornerRadius={3}
                                        activeOuterRadiusOffset={8}
                                        colors={{ scheme: 'category10' }}
                                        arcLinkLabelsSkipAngle={10}
                                        arcLinkLabelsTextColor="#333333"
                                        arcLabelsSkipAngle={10}
                                        legends={[
                                            {
                                                anchor: 'bottom',
                                                direction: 'row',
                                                translateY: 56,
                                                itemWidth: 100,
                                                itemHeight: 18,
                                                symbolSize: 18,
                                                symbolShape: 'circle'
                                            }
                                        ]}
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Processing Time (Days)</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <ResponsiveLine
                                        data={processingTimeData}
                                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                                        xScale={{ type: 'point' }}
                                        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Month',
                                            legendOffset: 36,
                                            legendPosition: 'middle'
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Days',
                                            legendOffset: -40,
                                            legendPosition: 'middle'
                                        }}
                                        pointSize={10}
                                        pointColor={{ theme: 'background' }}
                                        pointBorderWidth={2}
                                        pointBorderColor={{ from: 'serieColor' }}
                                        pointLabelYOffset={-12}
                                        useMesh={true}
                                        legends={[
                                            {
                                                anchor: 'bottom-right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 100,
                                                translateY: 0,
                                                itemsSpacing: 0,
                                                itemDirection: 'left-to-right',
                                                itemWidth: 80,
                                                itemHeight: 20,
                                                itemOpacity: 0.75,
                                                symbolSize: 12,
                                                symbolShape: 'circle'
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Success/Rejection Rates</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <ResponsiveBar
                                        data={successRateData}
                                        keys={['success', 'rejection']}
                                        indexBy="month"
                                        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                                        padding={0.3}
                                        valueScale={{ type: 'linear' }}
                                        indexScale={{ type: 'band', round: true }}
                                        colors={['#22c55e', '#ef4444']}
                                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Month',
                                            legendPosition: 'middle',
                                            legendOffset: 32
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Rate (%)',
                                            legendPosition: 'middle',
                                            legendOffset: -40
                                        }}
                                        labelSkipWidth={12}
                                        labelSkipHeight={12}
                                        legends={[
                                            {
                                                dataFrom: 'keys',
                                                anchor: 'bottom-right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 120,
                                                translateY: 0,
                                                itemsSpacing: 2,
                                                itemWidth: 100,
                                                itemHeight: 20,
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 0.85,
                                                symbolSize: 20
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="financial">
                        {/* Revenue Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Revenue
                                        <span className="text-xs text-green-600 ml-2">
                                            +{revenueStats.monthlyGrowth}%
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        ₱{revenueStats.total.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        ₱{revenueStats.paid.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-500">
                                        ₱{revenueStats.pending.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-500">
                                        ₱{revenueStats.overdue.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* New Financial Analytics Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Revenue Trend</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <ResponsiveLine
                                        data={[
                                            {
                                                id: "Revenue",
                                                color: "hsl(147, 88%, 38%)",
                                                data: monthlyRevenue.map(item => ({
                                                    x: item.month,
                                                    y: item.revenue,
                                                }))
                                            },
                                            {
                                                id: "Target",
                                                color: "hsl(0, 0%, 70%)",
                                                data: monthlyRevenue.map(item => ({
                                                    x: item.month,
                                                    y: item.target,
                                                }))
                                            }
                                        ]}
                                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                                        xScale={{ type: 'point' }}
                                        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: -45,
                                            legend: 'Month',
                                            legendOffset: 45,
                                            legendPosition: 'middle'
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Amount (₱)',
                                            legendOffset: -50,
                                            legendPosition: 'middle'
                                        }}
                                        pointSize={10}
                                        pointColor={{ theme: 'background' }}
                                        pointBorderWidth={2}
                                        pointBorderColor={{ from: 'serieColor' }}
                                        pointLabelYOffset={-12}
                                        useMesh={true}
                                        legends={[
                                            {
                                                anchor: 'bottom-right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 100,
                                                translateY: 0,
                                                itemsSpacing: 0,
                                                itemDirection: 'left-to-right',
                                                itemWidth: 80,
                                                itemHeight: 20,
                                                itemOpacity: 0.75,
                                                symbolSize: 12,
                                                symbolShape: 'circle'
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue by Permit Type</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <ResponsivePie
                                        data={permitTypeRevenue.map(item => ({
                                            id: item.permitType,
                                            label: item.permitType,
                                            value: item.revenue,
                                        }))}
                                        margin={{ top: 40, right: 80, bottom: 100, left: 80 }}
                                        innerRadius={0.5}
                                        padAngle={0.7}
                                        cornerRadius={3}
                                        activeOuterRadiusOffset={8}
                                        colors={{ scheme: 'green_blue' }}
                                        borderWidth={1}
                                        borderColor={{
                                            from: 'color',
                                            modifiers: [['darker', 0.2]]
                                        }}
                                        enableArcLinkLabels={true}
                                        arcLinkLabelsSkipAngle={10}
                                        arcLinkLabelsTextColor="#333333"
                                        arcLabelsSkipAngle={10}
                                        arcLabelsTextColor="#ffffff"
                                        legends={[
                                            {
                                                anchor: 'bottom',
                                                direction: 'row',
                                                justify: false,
                                                translateX: 0,
                                                translateY: 56,
                                                itemsSpacing: 0,
                                                itemWidth: 140,
                                                itemHeight: 18,
                                                itemTextColor: '#999',
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 1,
                                                symbolSize: 18,
                                                symbolShape: 'circle'
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
