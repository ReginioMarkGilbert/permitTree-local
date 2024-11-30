import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Settings,
  Shield,
  Users,
  Bell,
  Mail,
  Upload,
  Clock,
  Power,
  Key,
  UserCog,
  BellRing,
} from 'lucide-react';

const SettingSection = ({ icon: Icon, title, children }) => (
  <Card className="p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </Card>
);

const SettingItem = ({ label, children }) => (
  <div className="flex items-center justify-between py-4 border-b last:border-0">
    <Label className="flex-1">{label}</Label>
    <div className="flex-1">{children}</div>
  </div>
);

const SuperAdminSettingsPage = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="system">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Configuration
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SettingSection icon={Mail} title="Email Settings">
              <SettingItem label="SMTP Host">
                <Input placeholder="smtp.example.com" />
              </SettingItem>
              <SettingItem label="SMTP Port">
                <Input type="number" placeholder="587" />
              </SettingItem>
              <SettingItem label="SMTP Username">
                <Input placeholder="username" />
              </SettingItem>
              <SettingItem label="SMTP Password">
                <Input type="password" placeholder="••••••••" />
              </SettingItem>
            </SettingSection>

            <SettingSection icon={Upload} title="File Upload Settings">
              <SettingItem label="Max File Size (MB)">
                <Input type="number" placeholder="10" />
              </SettingItem>
              <SettingItem label="Allowed File Types">
                <Input placeholder=".pdf,.doc,.docx,.jpg,.png" />
              </SettingItem>
            </SettingSection>

            <SettingSection icon={Clock} title="Session Settings">
              <SettingItem label="Session Timeout (minutes)">
                <Input type="number" placeholder="30" />
              </SettingItem>
            </SettingSection>

            <SettingSection icon={Power} title="Maintenance">
              <SettingItem label="Maintenance Mode">
                <Switch />
              </SettingItem>
            </SettingSection>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SettingSection icon={Key} title="Password Policy">
              <SettingItem label="Minimum Password Length">
                <Input type="number" placeholder="8" />
              </SettingItem>
              <SettingItem label="Require Special Characters">
                <Switch />
              </SettingItem>
              <SettingItem label="Require Numbers">
                <Switch />
              </SettingItem>
              <SettingItem label="Password Expiry (days)">
                <Input type="number" placeholder="90" />
              </SettingItem>
            </SettingSection>

            <SettingSection icon={Shield} title="Security Controls">
              <SettingItem label="Max Login Attempts">
                <Input type="number" placeholder="5" />
              </SettingItem>
              <SettingItem label="Two-Factor Authentication">
                <Switch />
              </SettingItem>
            </SettingSection>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="user">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              User Management
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SettingSection icon={Users} title="Registration Settings">
              <SettingItem label="Allow New Registrations">
                <Switch />
              </SettingItem>
              <SettingItem label="Default User Role">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>
              <SettingItem label="Account Lockout Duration (minutes)">
                <Input type="number" placeholder="30" />
              </SettingItem>
            </SettingSection>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5" />
              Notification Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SettingSection icon={Bell} title="System Notifications">
              <SettingItem label="Email Notifications">
                <Switch />
              </SettingItem>
              <SettingItem label="System Alerts">
                <Switch />
              </SettingItem>
              <SettingItem label="User Activity Notifications">
                <Switch />
              </SettingItem>
            </SettingSection>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SuperAdminSettingsPage;
