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
   UserCheck
} from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';

const SA_UserDetailsViewModal = ({ isOpen, onClose, user }) => {
   if (!user) return null;

   const isPersonnel = user.userType === 'Personnel';

   const formatDateString = (dateString) => {
      if (!dateString) return 'Not available';

      try {
         let date;
         // Handle different date formats
         if (typeof dateString === 'string') {
            // Try parsing ISO string
            date = new Date(dateString);
         } else if (typeof dateString === 'number') {
            // Handle timestamp
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
      <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors">
         <div className="p-2 bg-background rounded-full shadow-sm">
            <Icon className="w-4 h-4 text-primary" />
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{value || 'N/A'}</p>
         </div>
      </div>
   );

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-[600px] p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
               <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold">
                     {isPersonnel ? 'Personnel Details' : 'User Details'}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                     View detailed information about the {isPersonnel ? 'personnel' : 'user'}
                  </DialogDescription>
               </div>
            </DialogHeader>

            <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
               <Card className="p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                     {isPersonnel ? 'Personnel Information' : 'Basic Information'}
                  </h3>
                  <div className="grid gap-3">
                     <InfoCard
                        icon={User}
                        title="Full Name"
                        value={`${user.firstName} ${user.lastName}`}
                     />
                     <InfoCard
                        icon={UserCheck}
                        title="Username"
                        value={user.username}
                     />
                     <InfoCard
                        icon={Shield}
                        title="Role"
                        value={user.roles?.join(', ').replace(/_/g, ' ')}
                     />
                     <InfoCard
                        icon={Mail}
                        title="Email"
                        value={user.email}
                     />
                     {!isPersonnel && (
                        <>
                           <InfoCard
                              icon={Phone}
                              title="Phone"
                              value={user.phone}
                           />
                           <InfoCard
                              icon={Building2}
                              title="Company"
                              value={user.company}
                           />
                           <InfoCard
                              icon={MapPin}
                              title="Address"
                              value={user.address}
                           />
                        </>
                     )}
                  </div>
               </Card>

               <Card className="p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">Account Activity</h3>
                  <div className="grid gap-3">
                     <InfoCard
                        icon={Clock}
                        title="Account Created"
                        value={formattedCreatedAt}
                     />
                     <InfoCard
                        icon={Calendar}
                        title="Last Login"
                        value={formattedLastLogin}
                     />
                  </div>
               </Card>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
               <Button
                  variant="outline"
                  onClick={onClose}
                  className="min-w-[100px]"
               >
                  Close
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default SA_UserDetailsViewModal;
