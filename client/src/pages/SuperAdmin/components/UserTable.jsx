import React from 'react';
import { Eye, Edit, Ban, Power, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

const UserTable = ({ users, onViewUser, onEditUser, onDeactivateUser, onActivateUser, onDeleteUser, isMobile }) => {
   const renderActionButtons = (user) => {
      const actions = [
         {
            icon: Eye,
            label: "View User",
            onClick: () => onViewUser(user),
            variant: "outline"
         },
         {
            icon: Edit,
            label: "Edit User",
            onClick: () => onEditUser(user),
            variant: "outline",
            className: "text-yellow-600 hover:text-yellow-800"
         },
         user.isActive ? {
            icon: Ban,
            label: "Deactivate User",
            onClick: () => onDeactivateUser(user),
            variant: "outline",
            className: "text-red-600 hover:text-red-800"
         } : {
            icon: Power,
            label: "Activate User",
            onClick: () => onActivateUser(user),
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         },
         {
            icon: Trash2,
            label: "Delete User",
            onClick: () => onDeleteUser(user),
            variant: "outline",
            className: "text-red-600 hover:text-red-800"
         }
      ];

      return actions.map((action, index) => (
         <TooltipProvider key={index}>
            <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                     variant={action.variant}
                     size="icon"
                     onClick={action.onClick}
                     className={action.className}
                  >
                     <action.icon className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>{action.label}</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      ));
   };

   if (isMobile) {
      return (
         <div className="space-y-4">
            {users.map((user) => (
               <Card key={user.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{`${user.firstName} ${user.lastName}`}</p>
                     </div>
                     <Badge variant={user.isActive ? 'success' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                     </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2">
                     {renderActionButtons(user)}
                  </div>
               </Card>
            ))}
         </div>
      );
   }

   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>Username</TableHead>
               <TableHead>Name</TableHead>
               <TableHead>Email</TableHead>
               <TableHead>Roles</TableHead>
               <TableHead>Status</TableHead>
               <TableHead className="text-right">Actions</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {users.map((user) => (
               <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles.join(', ')}</TableCell>
                  <TableCell>
                     <Badge
                        variant={user.isActive ? 'success' : 'secondary'}
                        className={user.isActive ?
                           'bg-green-100 text-green-800 hover:bg-green-100/80' :
                           'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
                        }
                     >
                        {user.isActive ? 'Active' : 'Inactive'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                        {renderActionButtons(user)}
                     </div>
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   );
};

export default UserTable;
