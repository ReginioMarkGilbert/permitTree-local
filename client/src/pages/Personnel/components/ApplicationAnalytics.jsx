import React from 'react';
import { Card } from "@/components/ui/card";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '@/components/ThemeProvider';

const ApplicationAnalytics = ({ data }) => {
   const { theme } = useTheme();
   const isDark = theme === 'dark';

   const {
      applicationTypes,
      statusData,
      weeklyVolume
   } = data;

   const commonPieProps = {
      margin: { top: 40, right: 80, bottom: 100, left: 80 },
      innerRadius: 0.5,
      padAngle: 0.7,
      cornerRadius: 3,
      activeOuterRadiusOffset: 8,
      borderWidth: 1,
      arcLinkLabelsSkipAngle: 10,
      arcLinkLabelsTextColor: isDark ? "#ffffff" : "#333333",
      arcLabelsSkipAngle: 10,
      theme: {
         legends: {
            text: {
               fill: isDark ? "#ffffff" : "#999999"
            }
         },
         tooltip: {
            container: {
               background: isDark ? "#1f2937" : "#ffffff",
               color: isDark ? "#ffffff" : "#333333",
            }
         }
      }
   };

   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-lg">
               <h2 className="text-xl font-semibold text-foreground mb-4">Applications by Type</h2>
               <div className="h-[400px]">
                  <ResponsivePie
                     {...commonPieProps}
                     data={applicationTypes}
                     colors={{ scheme: 'nivo' }}
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
                           itemDirection: 'left-to-right',
                           itemOpacity: 1,
                           symbolSize: 18,
                           symbolShape: 'circle',
                           effects: [
                              {
                                 on: 'hover',
                                 style: {
                                    itemTextColor: isDark ? '#ffffff' : '#000000'
                                 }
                              }
                           ]
                        }
                     ]}
                  />
               </div>
            </Card>

            <Card className="p-6 shadow-lg">
               <h2 className="text-xl font-semibold text-foreground mb-4">Application Status Distribution</h2>
               <div className="h-[400px]">
                  <ResponsivePie
                     {...commonPieProps}
                     data={statusData}
                     colors={{ scheme: 'category10' }}
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
            <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Application Volume</h2>
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
                  axisTop={null}
                  axisRight={null}
                  theme={{
                     axis: {
                        ticks: {
                           text: {
                              fill: isDark ? "#ffffff" : "#333333"
                           }
                        },
                        legend: {
                           text: {
                              fill: isDark ? "#ffffff" : "#333333"
                           }
                        }
                     },
                     tooltip: {
                        container: {
                           background: isDark ? "#1f2937" : "#ffffff",
                           color: isDark ? "#ffffff" : "#333333",
                        }
                     }
                  }}
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
                  labelTextColor={isDark ? "#ffffff" : "#000000"}
                  animate={true}
               />
            </div>
         </Card>
      </div>
   );
};

export default ApplicationAnalytics;
