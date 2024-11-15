import { useState, useEffect } from 'react';
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

export default function PersonnelReportsPage() {
    const [timeFilter, setTimeFilter] = useState('week');
    const [loading, setLoading] = useState(false);
    const [filteredData, setFilteredData] = useState({
        applicationTypes: [],
        statusData: [],
        processingTimeData: [],
        successRateData: []
    });

    // Mock data for application types
    const applicationTypesData = [
        { id: 'Chainsaw Registration', value: 450, label: 'Chainsaw Registration' },
        { id: 'Certificate of Registration', value: 300, label: 'Certificate of Registration' },
        { id: 'Private Land Timber Permit', value: 150, label: 'Private Land Timber Permit' },
        { id: 'Tree Plantation Registration', value: 100, label: 'Tree Plantation Registration' }
    ];

    // Mock data for application status
    const statusData = [
        { id: 'Approved', value: 600, label: 'Approved' },
        { id: 'Pending', value: 250, label: 'Pending' },
        { id: 'Rejected', value: 50, label: 'Rejected' },
        { id: 'Under Review', value: 100, label: 'Under Review' }
    ];

    // Mock data for processing time
    const processingTimeData = [
        {
            id: "Processing Time",
            data: [
                { x: 'Jan', y: 5 },
                { x: 'Feb', y: 4 },
                { x: 'Mar', y: 6 },
                { x: 'Apr', y: 3 },
                { x: 'May', y: 5 },
                { x: 'Jun', y: 4 }
            ]
        }
    ];

    // Mock data for success/rejection rates
    const successRateData = [
        { month: 'Jan', success: 85, rejection: 15 },
        { month: 'Feb', success: 88, rejection: 12 },
        { month: 'Mar', success: 90, rejection: 10 },
        { month: 'Apr', success: 87, rejection: 13 },
        { month: 'May', success: 92, rejection: 8 },
        { month: 'Jun', success: 89, rejection: 11 }
    ];

    useEffect(() => {
        // Simulate API call and data filtering
        setLoading(true);

        // Filter data based on timeFilter
        const filterData = () => {
            let filtered = {};

            switch(timeFilter) {
                case 'week':
                    filtered = {
                        applicationTypes: applicationTypesData.map(item => ({
                            ...item,
                            value: Math.floor(item.value * 0.2) // Show 20% for week
                        })),
                        statusData: statusData.map(item => ({
                            ...item,
                            value: Math.floor(item.value * 0.2)
                        })),
                        processingTimeData: [{
                            id: "Processing Time",
                            data: processingTimeData[0].data.slice(-7) // Last 7 days
                        }],
                        successRateData: successRateData.slice(-7)
                    };
                    break;
                case 'month':
                    filtered = {
                        applicationTypes: applicationTypesData.map(item => ({
                            ...item,
                            value: Math.floor(item.value * 0.5) // Show 50% for month
                        })),
                        statusData: statusData.map(item => ({
                            ...item,
                            value: Math.floor(item.value * 0.5)
                        })),
                        processingTimeData: [{
                            id: "Processing Time",
                            data: processingTimeData[0].data.slice(-30) // Last 30 days
                        }],
                        successRateData: successRateData.slice(-30)
                    };
                    break;
                default:
                    filtered = {
                        applicationTypes: applicationTypesData,
                        statusData: statusData,
                        processingTimeData: processingTimeData,
                        successRateData: successRateData
                    };
            }

            setFilteredData(filtered);
            setLoading(false);
        };

        filterData();
    }, [timeFilter]);

    if (loading) {
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

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <div className="max-w-7xl mx-auto pt-24">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-green-700">Application Analytics</h1>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 shadow-lg">
                        <h2 className="text-xl font-semibold text-green-700 mb-4">Applications by Type</h2>
                        <div className="h-[400px]">
                            <ResponsivePie
                                data={filteredData.applicationTypes}
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
                                data={filteredData.statusData}
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
                                data={filteredData.processingTimeData}
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
                                data={filteredData.successRateData}
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
            </div>
        </div>
    );
}
