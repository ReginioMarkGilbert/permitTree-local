import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
   User,
   Mail,
   Phone,
   Building2,
   MapPin,
   Shield,
   Calendar,
   CheckCircle2,
   XCircle,
   Clock,
   UserCheck,
   Activity
} from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';

const SA_UserDetailsViewModal = ({ isOpen, onClose, user }) => {
   if (!user) return null;

   // console.log('User data:', user);

   const profilePictureSrc = user.profilePicture
      ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`
      : null;

   // console.log('Profile Picture Source:', profilePictureSrc);

   const isPersonnel = user.userType === 'Personnel';

   const formatDateString = (dateString) => {
      if (!dateString) return 'Not available';

      try {
         let date;
         if (typeof dateString === 'string') {
            date = new Date(dateString);
         } else if (typeof dateString === 'number') {
            date = new Date(dateString);
         } else {
            return 'Invalid date';
         }

         if (!isValid(date)) {
            return 'Invalid date';
         }

         return format(date, 'MMMM d, yyyy');
      } catch (error) {
         console.error('Error formatting date:', error);
         return 'Date not available';
      }
   };

   const getLastLoginText = () => {
      if (!user.lastLoginDate) return 'Never logged in';

      try {
         let date;
         if (typeof user.lastLoginDate === 'string') {
            date = new Date(user.lastLoginDate);
         } else if (typeof user.lastLoginDate === 'number') {
            date = new Date(user.lastLoginDate);
         } else {
            return 'Invalid login date';
         }

         if (!isValid(date)) {
            return 'Invalid login date';
         }

         return formatDistanceToNow(date, { addSuffix: true });
      } catch (error) {
         console.error('Error formatting last login:', error);
         return 'Never logged in';
      }
   };

   const formattedCreatedAt = formatDateString(user.createdAt);
   const formattedLastLogin = getLastLoginText();

   const InfoCard = ({ icon: Icon, title, value, className = "" }) => (
      <div className="flex items-start gap-4 p-4 bg-card hover:bg-accent/5 rounded-lg transition-all duration-200 border border-border/50">
         <div className="p-2.5 bg-primary/10 rounded-full">
            <Icon className="w-5 h-5 text-primary" />
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-base font-medium text-foreground">{value || 'N/A'}</p>
         </div>
      </div>
   );

   const roles = {
      "Technical_Staff": "Technical Staff",
      "Chief_RPS": "Chief RPS",
      "Chief_TSD": "Chief TSD",
      "Billing_Collector": "Billing Collector",
      "PENR_CENR_Officer": "PENR CENR Officer"
   }

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-2xl p-0">
            <DialogHeader className="px-8 pt-8 pb-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
               <div className="flex items-center gap-4">
                  <div className="rounded-full">
                     {profilePictureSrc ? (
                        <img
                           src={profilePictureSrc}
                           alt="Profile"
                           className="w-16 h-16 rounded-full"
                        />
                     ) : (
                        <div className="p-3 bg-primary/20 rounded-full">
                           <User className="w-8 h-8 text-primary" />
                        </div>
                     )}
                  </div>
                  <div>
                     <DialogTitle className="text-2xl font-bold mb-1">
                        {`${user.firstName} ${user.lastName}`}
                     </DialogTitle>
                     <DialogDescription className="text-base">
                        {user.roles.includes("user") ? "Client" : roles[user.roles[0]]}
                     </DialogDescription>
                  </div>
               </div>
            </DialogHeader>

            <div className="px-8 py-6 space-y-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
               <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <UserCheck className="w-5 h-5 text-primary" />
                     Account Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                     <InfoCard
                        icon={Mail}
                        title="Email Address"
                        value={user.email}
                     />
                     <InfoCard
                        icon={Shield}
                        title="Username"
                        value={user.username}
                     />
                     {!isPersonnel && (
                        <>
                           <InfoCard
                              icon={Phone}
                              title="Phone Number"
                              value={user.phone}
                           />
                           <InfoCard
                              icon={Building2}
                              title="Company Name"
                              value={user.company}
                           />
                           <InfoCard
                              icon={MapPin}
                              title="Address"
                              value={user.address}
                              className="md:col-span-2"
                           />
                        </>
                     )}
                  </div>
               </section>

               <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-primary" />
                     Account Activity
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                     <InfoCard
                        icon={Calendar}
                        title="Account Created"
                        value={formattedCreatedAt}
                     />
                     <InfoCard
                        icon={Clock}
                        title="Last Login"
                        value={formattedLastLogin}
                     />
                  </div>
               </section>
            </div>

            <DialogFooter className="px-8 py-6 border-t bg-muted/30">
               <Button
                  variant="outline"
                  onClick={onClose}
                  className="min-w-[120px]"
               >
                  Close
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default SA_UserDetailsViewModal;
