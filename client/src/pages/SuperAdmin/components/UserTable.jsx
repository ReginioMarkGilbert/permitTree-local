import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Ban, CheckCircle, Trash2 } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";

const UserTable = ({ users, onViewUser, onEditUser, onDeactivateUser, onActivateUser, onDeleteUser }) => {
   const renderActionButtons = (user) => {
      const actions = [
         {
            icon: Eye,
            label: "View Details",
            onClick: () => onViewUser(user),
            variant: "ghost"
         },
         {
            icon: Pencil,
            label: "Edit User",
            onClick: () => onEditUser(user),
            variant: "ghost"
         },
         user.isActive ? {
            icon: Ban,
            label: "Deactivate User",
            onClick: () => onDeactivateUser(user),
            variant: "ghost",
            className: "text-yellow-600 hover:text-yellow-700"
         } : {
            icon: CheckCircle,
            label: "Activate User",
            onClick: () => onActivateUser(user),
            variant: "ghost",
            className: "text-green-600 hover:text-green-700"
         },
         {
            icon: Trash2,
            label: "Delete User",
            onClick: () => onDeleteUser(user),
            variant: "ghost",
            className: "text-red-600 hover:text-red-700"
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
                     className={`h-8 w-8 ${action.className || ''}`}
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
            {users?.map((user) => (
               <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                     {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                     {user.roles?.map((role) => (
                        <Badge
                           key={role}
                           variant="secondary"
                           className="bg-secondary/50 mr-1"
                        >
                           {role}
                        </Badge>
                     ))}
                  </TableCell>
                  <TableCell>
                     <Badge
                        variant={user.isActive ? "success" : "destructive"}
                        className={user.isActive ?
                           "bg-green-100 text-green-800 hover:bg-green-100/80" :
                           "bg-red-100 text-red-800 hover:bg-red-100/80"
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
