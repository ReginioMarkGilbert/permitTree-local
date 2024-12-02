import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
   Bell,
   Users,
   Settings,
   FileText,
   ArrowRight,
   Activity,
   HardDrive,
   Network
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ title, description, icon: Icon, to }) => (
   <Link to={to}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer dark:hover:bg-gray-800/50">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full dark:bg-primary/20">
               <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
               <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
               <p className="text-muted-foreground text-sm mt-1 dark:text-gray-400">{description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
         </div>
      </Card>
   </Link>
);

const SystemStatusCard = ({ title, value, status, icon: Icon }) => (
   <Card className="p-4 dark:bg-gray-800/50">
      <div className="flex gap-4">
         <div className={`p-2 rounded-full ${status === 'good' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-500' :
               status === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-500' :
                  'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500'
            }`}>
            <Icon className="w-4 h-4" />
         </div>
         <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
         </div>
      </div>
   </Card>
);

const SuperAdminHomePage = () => {
   const quickActions = [
      {
         title: "Manage Users",
         description: "Add, edit, or deactivate user accounts",
         icon: Users,
         to: "/superadmin/manage-users"
      },
      {
         title: "System Settings",
         description: "Configure system-wide settings and preferences",
         icon: Settings,
         to: "/superadmin/settings"
      },
      {
         title: "View Reports",
         description: "Access and generate system reports",
         icon: FileText,
         to: "/superadmin/reports"
      }
   ];

   const systemStatus = [
      {
         title: "Active Users",
         value: "124",
         status: "good",
         icon: Users
      },
      {
         title: "System Load",
         value: "65%",
         status: "warning",
         icon: Activity
      },
      {
         title: "Storage Usage",
         value: "42%",
         status: "good",
         icon: HardDrive
      },
      {
         title: "Active Sessions",
         value: "28",
         status: "good",
         icon: Network
      }
   ];

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col pt-16 transition-colors duration-300">
         <main className={`flex-grow transition-all duration-300 mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8 py-8`}>
            <div className="max-w-[85rem] mx-auto">
               <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, Super Admin</h1>
                  <p className="text-muted-foreground mt-2 dark:text-gray-400">Here's your system overview</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                     <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
                     <div className="space-y-4">
                        {quickActions.map((action, index) => (
                           <QuickActionCard key={index} {...action} />
                        ))}
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Status</h2>
                        <Button variant="outline" size="sm" className="dark:text-gray-300 dark:hover:text-white">
                           View Details
                        </Button>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {systemStatus.map((status, index) => (
                           <SystemStatusCard key={index} {...status} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default SuperAdminHomePage;
