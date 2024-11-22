import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const FinancialAnalytics = ({ data }) => {
   const { revenueStats } = data;

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
      </div>
   );
};

export default FinancialAnalytics;
