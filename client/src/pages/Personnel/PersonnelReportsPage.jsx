import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationAnalytics from './components/ApplicationAnalytics';
import FinancialAnalytics from './components/FinancialAnalytics';

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
            weeklyVolume {
                day
                count
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
        }
    }
`;

export default function PersonnelReportsPage() {
   const [timeFilter, setTimeFilter] = useState('week');
   const [activeTab, setActiveTab] = useState('applications');

   const { loading: appLoading, error: appError, data: appData } = useQuery(GET_APPLICATION_ANALYTICS, {
      variables: { timeFilter }
   });

   const { loading: financialLoading, error: financialError, data: financialData } = useQuery(GET_FINANCIAL_ANALYTICS, {
      variables: { timeFilter }
   });

   if (appLoading || financialLoading) return <Skeleton className="w-full h-[500px]" />;
   if (appError) return <p>Error loading application analytics: {appError.message}</p>;
   if (financialError) return <p>Error loading financial analytics: {financialError.message}</p>;

   const financialAnalyticsData = {
      revenueStats: financialData?.getFinancialAnalytics?.revenueStats || {
         total: 0, paid: 0, pending: 0, overdue: 0
      }
   };

   return (
      <div className="min-h-screen bg-green-50 px-4 sm:px-6 py-6 sm:py-8">
         <div className="max-w-7xl mx-auto pt-16 sm:pt-24">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-10">
               <h1 className="text-2xl sm:text-4xl font-bold text-green-700">Analytics Dashboard</h1>
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
                  <ApplicationAnalytics data={appData.getApplicationAnalytics} />
               </TabsContent>

               <TabsContent value="financial">
                  <FinancialAnalytics data={financialAnalyticsData} />
               </TabsContent>
            </Tabs>
         </div>
      </div>
   );
}
