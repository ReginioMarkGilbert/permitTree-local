import React from 'react';
import { Card } from "@/components/ui/card";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';

const ApplicationAnalytics = ({ data }) => {
   const {
      applicationTypes,
      statusData,
      weeklyVolume
   } = data;

   return (
      <div className="space-y-6">
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

         <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Weekly Application Volume</h2>
            <div className="h-[400px]">
               <ResponsiveBar
                  data={weeklyVolume}
                  keys={['count']}
                  indexBy="day"
                  margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors="#22c55e"
                  borderRadius={4}
                  borderColor={{
                     from: 'color',
                     modifiers: [['darker', 1.6]]
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                     tickSize: 5,
                     tickPadding: 5,
                     tickRotation: 0,
                     legend: 'Day of Week',
                     legendPosition: 'middle',
                     legendOffset: 32
                  }}
                  axisLeft={{
                     tickSize: 5,
                     tickPadding: 5,
                     tickRotation: 0,
                     legend: 'Number of Applications',
                     legendPosition: 'middle',
                     legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{
                     from: 'color',
                     modifiers: [['darker', 1.6]]
                  }}
                  animate={true}
               />
            </div>
         </Card>
      </div>
   );
};

export default ApplicationAnalytics;
