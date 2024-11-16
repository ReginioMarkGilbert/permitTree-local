import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';

const FinancialAnalytics = ({ data }) => {
   const {
      revenueStats,
      monthlyRevenueData,
      permitTypeRevenueData
   } = data;

   return (
      <div className="space-y-6">
         {/* Revenue Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                     Total Revenue
                     <span className="text-xs text-green-600 ml-2">
                        +{revenueStats.monthlyGrowth}%</span>
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

         {/* Charts */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
               <div className="p-6">
                  <h2 className="text-xl font-semibold text-green-700 mb-4">Monthly Revenue Trend</h2>
                  <div className="h-[400px]">
                     <ResponsiveLine
                        data={[
                           {
                              id: "Revenue",
                              color: "hsl(147, 88%, 38%)",
                              data: monthlyRevenueData
                           },
                           {
                              id: "Target",
                              color: "hsl(0, 0%, 70%)",
                              data: monthlyRevenueData.map(item => ({
                                 x: item.x,
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
                  </div>
               </div>
            </Card>

            <Card>
               <div className="p-6">
                  <h2 className="text-xl font-semibold text-green-700 mb-4">Revenue by Permit Type</h2>
                  <div className="h-[400px]">
                     <ResponsivePie
                        data={permitTypeRevenueData}
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
                  </div>
               </div>
            </Card>
         </div>
      </div>
   );
};

export default FinancialAnalytics;
