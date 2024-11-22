import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, Upload, Clock, FileCheck, Workflow, Save } from 'lucide-react';
import { toast } from 'sonner';

const PersonnelSettingsPage = () => {
   const [settings, setSettings] = useState({
      notificationPreferences: {
         email: true,
         inApp: true,
         sms: false,
      },
      applicationReviewDeadline: 7,
      defaultApplicationStatus: 'pending',
      autoAssignApplications: false,
      signatureImage: null,
   });

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

   const saveSettings = () => {
      // Here you would typically send the settings to your backend
      toast.success('Settings saved successfully');
   };

   return (
      <div className="min-h-screen bg-green-50/30 p-6 lg:p-8">
         <div className="max-w-6xl mx-auto space-y-8 pt-20">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
               <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
               <p className="text-muted-foreground">
                  Manage your application preferences and configurations.
               </p>
            </div>

            <div className="grid gap-6">
               {/* Notifications Section */}
               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 rounded-md bg-green-100">
                           <Bell className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                           <h2 className="text-xl font-semibold">Notifications</h2>
                           <p className="text-sm text-muted-foreground">
                              Configure how you want to receive notifications.
                           </p>
                        </div>
                     </div>

                     <div className="grid gap-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-gray-500" />
                              <div>
                                 <Label className="font-medium">Email Notifications</Label>
                                 <p className="text-sm text-muted-foreground">Receive updates via email</p>
                              </div>
                           </div>
                           <Switch
                              checked={settings.notificationPreferences.email}
                              onCheckedChange={() => handleNotificationChange('email')}
                              className="data-[state=checked]:bg-green-600"
                           />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Bell className="h-5 w-5 text-gray-500" />
                              <div>
                                 <Label className="font-medium">In-App Notifications</Label>
                                 <p className="text-sm text-muted-foreground">Receive updates within the app</p>
                              </div>
                           </div>
                           <Switch
                              checked={settings.notificationPreferences.inApp}
                              onCheckedChange={() => handleNotificationChange('inApp')}
                              className="data-[state=checked]:bg-green-600"
                           />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <MessageSquare className="h-5 w-5 text-gray-500" />
                              <div>
                                 <Label className="font-medium">SMS Notifications</Label>
                                 <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
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
               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 rounded-md bg-green-100">
                           <FileCheck className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                           <h2 className="text-xl font-semibold">Application Settings</h2>
                           <p className="text-sm text-muted-foreground">
                              Configure application processing preferences.
                           </p>
                        </div>
                     </div>

                     <div className="grid gap-6">
                        <div className="space-y-4">
                           <div>
                              <Label className="font-medium">Review Deadline</Label>
                              <p className="text-sm text-muted-foreground mb-2">Set the default review period for applications</p>
                              <div className="flex items-center gap-2">
                                 <Clock className="h-5 w-5 text-gray-500" />
                                 <Input
                                    type="number"
                                    name="applicationReviewDeadline"
                                    value={settings.applicationReviewDeadline}
                                    onChange={handleInputChange}
                                    className="max-w-[200px]"
                                 />
                                 <span className="text-sm text-muted-foreground">days</span>
                              </div>
                           </div>

                           <Separator />

                           <div>
                              <Label className="font-medium">Default Status</Label>
                              <p className="text-sm text-muted-foreground mb-2">Set the initial status for new applications</p>
                              <Select
                                 name="defaultApplicationStatus"
                                 value={settings.defaultApplicationStatus}
                                 onValueChange={(value) => handleInputChange({ target: { name: 'defaultApplicationStatus', value } })}
                              >
                                 <SelectTrigger className="max-w-[200px]">
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

                           <Separator />

                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <Workflow className="h-5 w-5 text-gray-500" />
                                 <div>
                                    <Label className="font-medium">Auto Assignment</Label>
                                    <p className="text-sm text-muted-foreground">Automatically assign applications to available staff</p>
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
               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 rounded-md bg-green-100">
                           <Upload className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                           <h2 className="text-xl font-semibold">Digital Signature</h2>
                           <p className="text-sm text-muted-foreground">
                              Upload your signature for official documents.
                           </p>
                        </div>
                     </div>

                     <div className="grid gap-4">
                        <div className="flex items-center justify-center w-full">
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                 <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                 <p className="text-sm text-gray-500">Click to upload signature</p>
                                 <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
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
                           <p className="text-sm text-gray-500 text-center">
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
                     className="bg-green-600 hover:bg-green-700 text-white gap-2"
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
