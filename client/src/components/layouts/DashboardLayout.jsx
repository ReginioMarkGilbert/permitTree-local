import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardLayout = ({
   title,
   description,
   onRefresh,
   isMobile,
   mainTabs,
   subTabs,
   activeMainTab,
   activeSubTab,
   onMainTabChange,
   onSubTabChange,
   tabDescription,
   filters,
   children
}) => {
   const hasSubTabs = subTabs && Object.keys(subTabs).length > 0;
   const showMainTabs = mainTabs && mainTabs.length > 0;

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto space-y-6 pt-10">
            {/* Header Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                     <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{title}</CardTitle>
                     <CardDescription className="text-gray-600 dark:text-gray-300 pt-1">{description}</CardDescription>
                  </div>
                  <Button onClick={onRefresh} variant="outline" size="sm">
                     <RefreshCw className="mr-2 h-4 w-4" />
                     {!isMobile && "Refresh"}
                  </Button>
               </CardHeader>
               <CardContent className="space-y-6">
                  {/* Main Tabs */}
                  {showMainTabs && (
                     isMobile ? (
                        <div className="space-y-4">
                           <select
                              value={activeMainTab}
                              onChange={(e) => onMainTabChange(e.target.value)}
                              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm dark:text-white"
                           >
                              {mainTabs.map((tab) => (
                                 <option key={tab} value={tab}>{tab}</option>
                              ))}
                           </select>
                           {hasSubTabs && (
                              <select
                                 value={activeSubTab}
                                 onChange={(e) => onSubTabChange(e.target.value)}
                                 className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm dark:text-white"
                              >
                                 {subTabs[activeMainTab].map((tab) => (
                                    <option key={tab} value={tab}>{tab}</option>
                                 ))}
                              </select>
                           )}
                        </div>
                     ) : (
                        <div className="space-y-4 border-t pt-4">
                           <Tabs value={activeMainTab} onValueChange={onMainTabChange}>
                              <TabsList>
                                 {mainTabs.map((tab) => (
                                    <TabsTrigger
                                       key={tab}
                                       value={tab}
                                       className="dark:text-white data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:text-black hover:text-black dark:hover:text-black dark:hover:bg-white"
                                    >
                                       {tab}
                                    </TabsTrigger>
                                 ))}
                              </TabsList>
                           </Tabs>

                           {hasSubTabs && (
                              <Tabs value={activeSubTab} onValueChange={onSubTabChange}>
                                 <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
                                    {subTabs[activeMainTab].map((tab) => (
                                       <TabsTrigger
                                          key={tab}
                                          value={tab}
                                          className="dark:text-white data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:text-black hover:text-black dark:hover:text-black dark:hover:bg-white"
                                       >
                                          {tab}
                                       </TabsTrigger>
                                    ))}
                                 </TabsList>
                              </Tabs>
                           )}
                        </div>
                     )
                  )}

                  {/* Tab Description */}
                  {tabDescription && (
                     <div className="text-gray-600 text-sm text-muted-foreground pt-2 pl-1 dark:text-gray-300">
                        {tabDescription}
                     </div>
                  )}
                  {filters && (
                     <div className="border-t pt-6">
                        {filters}
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Content Card */}
            <Card>
               <CardContent className="pt-6">
                  {children}
               </CardContent>
            </Card>
         </div>
      </div>
   );
};

export default DashboardLayout;
