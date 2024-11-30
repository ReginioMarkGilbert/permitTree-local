import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
   Users,
   FileText,
   Activity,
   AlertCircle,
   ArrowUpRight,
   ArrowDownRight,
   KeyRound,
   UserCog,
   UserPlus,
   ChevronRight,
   Database,
   LogIn,
   LogOut,
   Upload,
   CreditCard,
   CheckCircle,
   Mail,
   Settings,
   FileCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer
} from 'recharts';
import useDashboardData from './hooks/useDashboardData';
import { mockDashboardData } from './data/mockDashboardData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
   <Card className="p-6">
      <div className="flex justify-between items-start">
         <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {trend && (
               <p className={`text-sm mt-2 flex items-center ${
                  trendValue.includes('increase') ? 'text-green-600' : 'text-red-600'
               }`}>
                  {trendValue.includes('increase') ?
                     <ArrowUpRight className="w-4 h-4 mr-1" /> :
                     <ArrowDownRight className="w-4 h-4 mr-1" />
                  }
                  {trendValue}
               </p>
            )}
         </div>
         <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="w-5 h-5 text-primary" />
         </div>
      </div>
   </Card>
);

const ActivityItem = ({ activity }) => {
   // Enhanced activity icon mapping
   const getActivityIcon = (type) => {
      const icons = {
         LOGIN: LogIn,
         LOGOUT: LogOut,
         PROFILE_UPDATE: UserCog,
         PASSWORD_CHANGE: KeyRound,
         APPLICATION_SUBMIT: FileText,
         PAYMENT_MADE: CreditCard,
         DOCUMENT_UPLOAD: Upload,
         ACCOUNT_CREATED: UserPlus,
         PERMIT_RECEIVED: FileCheck,
         EMAIL_VERIFIED: Mail,
         SETTINGS_UPDATED: Settings
      };
      return icons[type] || Activity;
   };

   // Get appropriate color based on activity type
   const getActivityColor = (type) => {
      const colors = {
         LOGIN: 'text-green-500',
         LOGOUT: 'text-orange-500',
         PROFILE_UPDATE: 'text-blue-500',
         PASSWORD_CHANGE: 'text-yellow-500',
         APPLICATION_SUBMIT: 'text-purple-500',
         PAYMENT_MADE: 'text-emerald-500',
         DOCUMENT_UPLOAD: 'text-cyan-500',
         ACCOUNT_CREATED: 'text-indigo-500',
         PERMIT_RECEIVED: 'text-teal-500',
         EMAIL_VERIFIED: 'text-sky-500',
         SETTINGS_UPDATED: 'text-violet-500'
      };
      return colors[type] || 'text-gray-500';
   };

   const Icon = getActivityIcon(activity.type);
   const colorClass = getActivityColor(activity.type);
   const formattedDate = format(new Date(activity.timestamp), 'MMM d, h:mm a');

   // Enhanced activity item with metadata display
   return (
      <div className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors">
         <div className={`p-2 bg-background rounded-full ${colorClass}`}>
            <Icon className="w-4 h-4" />
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
               <p className="text-sm font-medium truncate">
                  <span className="font-semibold">{activity.username}</span>
                  {' '}{activity.description}
               </p>
               {activity.metadata?.applicationId && (
                  <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">
                     {activity.metadata.applicationId.applicationNumber}
                  </span>
               )}
            </div>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-xs text-muted-foreground">{formattedDate}</p>
               {activity.metadata?.deviceType && (
                  <span className="text-xs text-muted-foreground">
                     • {activity.metadata.deviceType}
                  </span>
               )}
               {activity.metadata?.amount && (
                  <span className="text-xs text-emerald-500 font-medium">
                     • ₱{activity.metadata.amount.toLocaleString()}
                  </span>
               )}
            </div>
         </div>
      </div>
   );
};

const SuperAdminDashboard = () => {
   const navigate = useNavigate();
   const [useMockData, setUseMockData] = useState(false);
   const { data: realData, loading, error, refetch } = useDashboardData();

   const dashboardData = useMockData ? mockDashboardData : realData;

   const [isRefreshing, setIsRefreshing] = useState(false);

   const handleRefresh = async () => {
      setIsRefreshing(true);
      try {
         await refetch();
      } catch (error) {
         console.error('Error refreshing data:', error);
      } finally {
         setIsRefreshing(false);
      }
   };

   if (!useMockData && loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="flex flex-col items-center gap-4">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
               <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
         </div>
      );
   }

   if (!useMockData && error) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
            <Card className="p-6 max-w-md">
               <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
               <p className="text-muted-foreground">{error.message}</p>
               <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setUseMockData(true)}
               >
                  Switch to Mock Data
               </Button>
            </Card>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
         <div className="p-8 max-w-7xl mx-auto pt-24">
            <div className="mb-8">
               <div className="flex justify-between items-center">
                  <div>
                     <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                     <p className="text-muted-foreground mt-2">Welcome to the super admin dashboard</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Database className="w-4 h-4 text-muted-foreground" />
                     <Label htmlFor="data-toggle" className="text-sm text-muted-foreground">
                        {useMockData ? 'Using Mock Data' : 'Using Real Data'}
                     </Label>
                     <Switch
                        id="data-toggle"
                        checked={!useMockData}
                        onCheckedChange={(checked) => setUseMockData(!checked)}
                     />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <StatCard
                  title="Total Users"
                  value={dashboardData?.totalUsers || 0}
                  icon={Users}
                  trend="up"
                  trendValue={dashboardData?.usersTrend || '0% increase'}
               />
               <StatCard
                  title="Active Users"
                  value={dashboardData?.activeUsers || 0}
                  icon={Activity}
                  trend="up"
                  trendValue={dashboardData?.activeUsersTrend || '0% increase'}
               />
               <StatCard
                  title="Total Applications"
                  value={dashboardData?.totalApplications || 0}
                  icon={FileText}
                  trend="down"
                  trendValue={dashboardData?.applicationsTrend || '0% decrease'}
               />
               <StatCard
                  title="Pending Applications"
                  value={dashboardData?.pendingApplications || 0}
                  icon={AlertCircle}
                  trend="up"
                  trendValue={dashboardData?.pendingApplicationsTrend || '0% increase'}
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold">User Growth</h3>
                     <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                        onClick={() => navigate('/superadmin/manage-users')}
                     >
                        Manage Users <ChevronRight className="ml-1 h-4 w-4" />
                     </Button>
                  </div>
                  <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData?.userActivity || []}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis
                              dataKey="date"
                              tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                           />
                           <YAxis />
                           <Tooltip
                              labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                           />
                           <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#2563eb"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </Card>

               <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold">Recent Activities</h3>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                           Last updated: {format(new Date(), 'MMM d, h:mm a')}
                        </span>
                        <Button
                           variant="ghost"
                           size="sm"
                           className="text-primary hover:text-primary/80"
                           onClick={handleRefresh}
                           disabled={isRefreshing}
                        >
                           <Activity className={cn(
                              "w-4 h-4 mr-1",
                              isRefreshing && "animate-spin"
                           )} />
                           {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                     </div>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                     {(dashboardData?.recentActivities || []).length > 0 ? (
                        dashboardData.recentActivities.map((activity) => (
                           <ActivityItem key={activity.id} activity={activity} />
                        ))
                     ) : (
                        <div className="text-center py-8 text-muted-foreground">
                           <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                           <p>No recent activities</p>
                        </div>
                     )}
                  </div>
                  <Button
                     variant="ghost"
                     className="w-full mt-4 text-primary hover:text-primary/80"
                     onClick={() => navigate('/superadmin/activities')}
                  >
                     View All Activities <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
               </Card>
            </div>
         </div>
      </div>
   );
};

export default SuperAdminDashboard;
