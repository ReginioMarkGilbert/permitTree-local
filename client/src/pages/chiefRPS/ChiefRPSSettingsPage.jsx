import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Label } from "../../components/ui/Label";

const ChiefRPSSettingsPage = () => {
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
        console.log('Saving settings:', settings);
        // Implement API call to save settings
    };

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-6">Chief RPS Settings</h1>
            <Card className="max-w-2xl mx-auto bg-white shadow-md">
                <CardHeader className="bg-green-700 text-white">
                    <CardTitle className="text-2xl">Configuration Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-green-700">Notification Preferences</h3>
                        <div className="flex space-x-4">
                            {['email', 'inApp', 'sms'].map((type) => (
                                <Label key={type} className="flex items-center space-x-2 cursor-pointer">
                                    <Switch
                                        checked={settings.notificationPreferences[type]}
                                        onCheckedChange={() => handleNotificationChange(type)}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700 capitalize">{type === 'inApp' ? 'In-App' : type}</span>
                                </Label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="applicationReviewDeadline" className="text-sm font-medium text-gray-700">
                            Application Review Deadline (days)
                        </Label>
                        <Input
                            id="applicationReviewDeadline"
                            type="number"
                            name="applicationReviewDeadline"
                            value={settings.applicationReviewDeadline}
                            onChange={handleInputChange}
                            className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="defaultApplicationStatus" className="text-sm font-medium text-gray-700">
                            Default Application Status
                        </Label>
                        <Select
                            name="defaultApplicationStatus"
                            value={settings.defaultApplicationStatus}
                            onValueChange={(value) => handleInputChange({ target: { name: 'defaultApplicationStatus', value } })}
                        >
                            <SelectTrigger id="defaultApplicationStatus" className="border-green-300 focus:border-green-500 focus:ring-green-500">
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

                    <Label className="flex items-center space-x-2 cursor-pointer">
                        <Switch
                            checked={settings.autoAssignApplications}
                            onCheckedChange={() => handleSwitchChange('autoAssignApplications')}
                            className="data-[state=checked]:bg-green-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Auto-assign Applications</span>
                    </Label>

                    <div className="space-y-2">
                        <Label htmlFor="signatureUpload" className="text-sm font-medium text-gray-700">
                            Upload Signature Image
                        </Label>
                        <Input
                            id="signatureUpload"
                            type="file"
                            onChange={handleSignatureUpload}
                            className="border-green-300 focus:border-green-500 focus:ring-green-500"
                            accept="image/*"
                        />
                        {settings.signatureImage && (
                            <p className="text-sm text-gray-500">Current signature: {settings.signatureImage}</p>
                        )}
                    </div>

                    <Button onClick={saveSettings} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Save Settings
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChiefRPSSettingsPage;
