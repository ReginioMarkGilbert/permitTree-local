import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, Upload, Clock, FileCheck, Workflow, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, gql, useQuery } from '@apollo/client';

const GET_ADMIN_SETTINGS = gql`
  query GetCurrentAdmin {
    getCurrentAdmin {
      id
      email
      notificationPreferences {
        email
        inApp
        sms
      }
    }
  }
`;

const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($preferences: NotificationPreferencesInput!, $email: String) {
    updateNotificationSettings(preferences: $preferences, email: $email) {
      id
      email
      notificationPreferences {
        email
        inApp
        sms
      }
    }
  }
`;

const PersonnelSettingsPage = () => {
   const { data: adminData, loading } = useQuery(GET_ADMIN_SETTINGS);
   const [settings, setSettings] = useState({
      notificationPreferences: {
         email: false,
         inApp: true,
         sms: false,
      },
      email: '',
      applicationReviewDeadline: 7,
      defaultApplicationStatus: 'pending',
      autoAssignApplications: false,
      signatureImage: null,
   });

   useEffect(() => {
      if (adminData?.getCurrentAdmin) {
         const admin = adminData.getCurrentAdmin;
         setSettings(prev => ({
            ...prev,
            email: admin.email || '',
            notificationPreferences: {
               email: admin.notificationPreferences?.email ?? false,
               inApp: admin.notificationPreferences?.inApp ?? true,
               sms: admin.notificationPreferences?.sms ?? false
            }
         }));
      }
   }, [adminData]);

   const [updateNotificationSettings] = useMutation(UPDATE_NOTIFICATION_SETTINGS);

   const handleNotificationChange = (type) => {
      setSettings(prev => ({
         ...prev,
         notificationPreferences: {
            ...prev.notificationPreferences,
            [type]: !prev.notificationPreferences[type]
         }
      }));
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSettings(prev => ({ ...prev, [name]: value }));
   };

   const handleSwitchChange = (name) => {
      setSettings(prev => ({ ...prev, [name]: !prev[name] }));
   };

   const handleSignatureUpload = (e) => {
      // Handle signature image upload
      const file = e.target.files[0];
      // You would typically upload this file to your server here
      setSettings(prev => ({ ...prev, signatureImage: file.name }));
   };

   const saveSettings = async () => {
      try {
         if (settings.notificationPreferences.email && !settings.email) {
            return toast.error('Please enter an email address for email notifications');
         }

         await updateNotificationSettings({
            variables: {
               preferences: settings.notificationPreferences,
               email: settings.email
            }
         });

         toast.success('Settings saved successfully');
      } catch (error) {
         console.error('Error saving settings:', error);
         toast.error('Failed to save settings');
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 p-6 lg:p-8">
         <div className="max-w-6xl mx-auto space-y-8 pt-20">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
               <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
               <p className="text-gray-600 dark:text-gray-300">
                  Manage your application preferences and configurations.
               </p>
            </div>

            <div className="grid gap-6">
               {/* Notifications Section */}
               <Card className="dark:bg-black">
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
                           <Bell className="h-5 w-5 text-green-700 dark:text-green-300" />
                        </div>
                        <div>
                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                           <p className="text-sm text-gray-600 dark:text-gray-300">
                              Configure how you want to receive notifications.
                           </p>
                        </div>
                     </div>

                     <div className="grid gap-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="flex-grow">
                                 <Label className="font-medium text-gray-900 dark:text-white">Email Notifications</Label>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates via email</p>
                                 {settings.notificationPreferences.email && (
                                    <Input
                                       type="email"
                                       value={settings.email}
                                       onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                                       placeholder="Enter your email"
                                       className="mt-2 w-full max-w-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                 )}
                              </div>
                           </div>
                           <Switch
                              checked={settings.notificationPreferences.email}
                              onCheckedChange={() => handleNotificationChange('email')}
                              className="data-[state=checked]:bg-green-600"
                           />
                        </div>

                        <Separator className="dark:border-gray-700" />

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div>
                                 <Label className="font-medium text-gray-900 dark:text-white">In-App Notifications</Label>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates within the app</p>
                              </div>
                           </div>
                           <Switch
                              checked={settings.notificationPreferences.inApp}
                              onCheckedChange={() => handleNotificationChange('inApp')}
                              className="data-[state=checked]:bg-green-600"
                           />
                        </div>

                        <Separator className="dark:border-gray-700" />

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div>
                                 <Label className="font-medium text-gray-900 dark:text-white">SMS Notifications</Label>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates via SMS</p>
                              </div>
                           </div>
                           <Switch
                              checked={settings.notificationPreferences.sms}
                              onCheckedChange={() => handleNotificationChange('sms')}
                              className="data-[state=checked]:bg-green-600"
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Application Settings Section */}
               <Card className="dark:bg-black">
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
                           <FileCheck className="h-5 w-5 text-green-700 dark:text-green-300" />
                        </div>
                        <div>
                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Application Settings</h2>
                           <p className="text-sm text-gray-600 dark:text-gray-300">
                              Configure application processing preferences.
                           </p>
                        </div>
                     </div>

                     <div className="grid gap-6">
                        <div className="space-y-4">
                           <div>
                              <Label className="font-medium text-gray-900 dark:text-white">Review Deadline</Label>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Set the default review period for applications</p>
                              <div className="flex items-center gap-2">
                                 <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                 <Input
                                    type="number"
                                    name="applicationReviewDeadline"
                                    value={settings.applicationReviewDeadline}
                                    onChange={handleInputChange}
                                    className="max-w-[200px] dark:bg-gray-700 dark:border-gray-600"
                                 />
                                 <span className="text-sm text-gray-600 dark:text-gray-300">days</span>
                              </div>
                           </div>

                           <Separator className="dark:border-gray-700" />

                           <div>
                              <Label className="font-medium text-gray-900 dark:text-white">Default Status</Label>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Set the initial status for new applications</p>
                              <Select
                                 name="defaultApplicationStatus"
                                 value={settings.defaultApplicationStatus}
                                 onValueChange={(value) => handleInputChange({ target: { name: 'defaultApplicationStatus', value } })}
                              >
                                 <SelectTrigger className="max-w-[200px] dark:bg-gray-700 dark:border-gray-600">
                                    <SelectValue placeholder="Select status" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           <Separator className="dark:border-gray-700" />

                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <Workflow className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                 <div>
                                    <Label className="font-medium text-gray-900 dark:text-white">Auto Assignment</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Automatically assign applications to available staff</p>
                                 </div>
                              </div>
                              <Switch
                                 checked={settings.autoAssignApplications}
                                 onCheckedChange={() => handleSwitchChange('autoAssignApplications')}
                                 className="data-[state=checked]:bg-green-600"
                              />
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Signature Upload Section */}
               <Card className="dark:bg-black">
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
                           <Upload className="h-5 w-5 text-green-700 dark:text-green-300" />
                        </div>
                        <div>
                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Digital Signature</h2>
                           <p className="text-sm text-gray-600 dark:text-gray-300">
                              Upload your signature for official documents.
                           </p>
                        </div>
                     </div>

                     <div className="grid gap-4">
                        <div className="flex items-center justify-center w-full">
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                 <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                                 <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload signature</p>
                                 <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 2MB</p>
                              </div>
                              <Input
                                 type="file"
                                 className="hidden"
                                 onChange={handleSignatureUpload}
                                 accept="image/*"
                              />
                           </label>
                        </div>
                        {settings.signatureImage && (
                           <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                              Current: {settings.signatureImage}
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>

               {/* Save Button */}
               <div className="flex justify-end">
                  <Button
                     onClick={saveSettings}
                     className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2"
                  >
                     <Save className="h-4 w-4" />
                     Save Changes
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PersonnelSettingsPage;
