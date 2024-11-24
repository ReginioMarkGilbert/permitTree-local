import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

const UserAnalytics = ({ data }) => {
   if (!data) return null;

   const { totalUsers, activeUsers, newUsers } = data;

   return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {/* Total Users Card */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Users</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalUsers}</div>
               <p className="text-xs text-muted-foreground">
                  Registered users
               </p>
            </CardContent>
         </Card>

         {/* Active Users Card */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Active Users</CardTitle>
               <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{activeUsers}</div>
               <p className="text-xs text-muted-foreground">
                  Active in last 30 days
               </p>
            </CardContent>
         </Card>

         {/* New Users Graph */}
         <Card className="col-span-full">
            <CardHeader>
               <CardTitle>New Users This Week</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={newUsers}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="day" />
                     <YAxis allowDecimals={false} />
                     <Tooltip />
                     <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>
   );
};

export default UserAnalytics;
