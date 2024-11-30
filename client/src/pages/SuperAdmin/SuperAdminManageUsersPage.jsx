import React, { useState, useCallback } from 'react';
import useUsers from './hooks/useUsers';
import UserTable from './components/UserTable';
import SA_UserDetailsViewModal from './components/SA_userDetailsViewModal';
import SA_UserEditDetailsModal from './components/SA_userEditDetailsModal';
import SA_AddUserModal from './components/SA_AddUserModal';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const ROLES = {
   ALL_ROLES: 'All Roles',
   Chief_RPS: 'Chief RPS',
   superadmin: 'Super Admin',
   Technical_Staff: 'Technical Staff',
   Chief_TSD: 'Chief TSD',
   Receiving_Clerk: 'Receiving Clerk',
   Releasing_Clerk: 'Releasing Clerk',
   Accountant: 'Accountant',
   OOP_Staff_Incharge: 'OOP Staff Incharge',
   Bill_Collector: 'Bill Collector',
   Credit_Officer: 'Credit Officer',
   PENR_CENR_Officer: 'PENR/CENR Officer',
   Deputy_CENR_Officer: 'Deputy CENR Officer',
   Inspection_Team: 'Inspection Team'
};

const SuperAdminManageUsersPage = () => {
   const { users, loading, error, updateUser, addUser, deactivateUser, activateUser, deleteUser, refetch } = useUsers();
   const [selectedUser, setSelectedUser] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
   const [userToDeactivate, setUserToDeactivate] = useState(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [userToDelete, setUserToDelete] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [dateRange, setDateRange] = useState({ from: null, to: null });
   const [selectedRole, setSelectedRole] = useState('ALL_ROLES');

   const handleViewUser = useCallback((user) => {
      setSelectedUser(user);
      setIsViewModalOpen(true);
   }, []);

   const handleEditUser = useCallback((user) => {
      setSelectedUser(user);
      setIsEditModalOpen(true);
   }, []);

   const handleDeactivateUser = useCallback((user) => {
      setUserToDeactivate(user);
      setIsDeactivateModalOpen(true);
   }, []);

   const handleActivateUser = useCallback(async (user) => {
      try {
         await activateUser(user.id);
      } catch (err) {
         console.error('Failed to activate user:', err);
      }
   }, [activateUser]);

   const confirmDeactivate = useCallback(async () => {
      if (userToDeactivate) {
         try {
            await deactivateUser(userToDeactivate.id);
            setIsDeactivateModalOpen(false);
            setUserToDeactivate(null);
         } catch (err) {
            console.error('Failed to deactivate user:', err);
         }
      }
   }, [deactivateUser, userToDeactivate]);

   const handleSaveUser = useCallback(async (updatedUserData) => {
      try {
         await updateUser(selectedUser.id, updatedUserData);
         setIsEditModalOpen(false);
         setSelectedUser(null);
      } catch (err) {
         console.error('Failed to update user:', err);
      }
   }, [selectedUser, updateUser]);

   const handleAddUser = useCallback(async (newUserData) => {
      try {
         await addUser(newUserData);
         setIsAddModalOpen(false);
      } catch (err) {
         console.error('Failed to add user:', err);
      }
   }, [addUser]);

   const handleDeleteUser = useCallback((user) => {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
   }, []);

   const confirmDelete = useCallback(async () => {
      if (userToDelete) {
         try {
            await deleteUser(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
         } catch (err) {
            console.error('Failed to delete user:', err);
         }
      }
   }, [deleteUser, userToDelete]);

   const handleClearFilters = () => {
      setSearchQuery('');
      setDateRange({ from: null, to: null });
      setSelectedRole('ALL_ROLES');
   };

   const filteredUsers = users?.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === 'ALL_ROLES' || user.role === selectedRole;

      const matchesDate = (!dateRange.from || !dateRange.to) ? true :
         new Date(user.createdAt) >= dateRange.from &&
         new Date(user.createdAt) <= dateRange.to;

      return matchesSearch && matchesRole && matchesDate;
   });

   if (loading) return <div>Loading...</div>;
   if (error) return <div>Error: {error}</div>;

   const FiltersSection = (
      <div className="flex flex-col gap-4 sm:flex-row items-end mb-6">
         <div className="flex-1 min-w-[200px] relative">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
               />
            </div>
         </div>
         <div className="min-w-[240px]">
            <DateRangePicker
               value={dateRange}
               onChange={setDateRange}
            />
         </div>
         <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[220px]">
               <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
               {Object.entries(ROLES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                     {label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
         <Button
            variant="outline"
            onClick={handleClearFilters}
            className="whitespace-nowrap"
         >
            Clear Filters
         </Button>
         <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">Add New User</Button>
      </div>
   );

   return (
      <DashboardLayout
         title="Manage Users"
         description="View and manage all user accounts in the system"
         onRefresh={refetch}
         filters={FiltersSection}
      >
         <UserTable
            users={filteredUsers}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeactivateUser={handleDeactivateUser}
            onActivateUser={handleActivateUser}
            onDeleteUser={handleDeleteUser}
         />
         <SA_UserDetailsViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            user={selectedUser}
         />
         <SA_UserEditDetailsModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={selectedUser}
            onSave={handleSaveUser}
         />
         <SA_AddUserModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddUser={handleAddUser}
         />
         <AlertDialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This will deactivate the user account. The user will no longer be able to log in.
                     This action can be reversed by reactivating the account later.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeactivateModalOpen(false)}>
                     Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeactivate}>
                     Deactivate
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
         <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete this user account? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
                     Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </DashboardLayout>
   );
};

export default SuperAdminManageUsersPage;
