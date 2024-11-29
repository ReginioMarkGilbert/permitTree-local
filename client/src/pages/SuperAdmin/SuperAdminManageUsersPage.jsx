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

   if (loading) return <div>Loading...</div>;
   if (error) return <div>Error: {error}</div>;

   const AddUserButton = (
      <Button onClick={() => setIsAddModalOpen(true)}>Add New User</Button>
   );

   return (
      <DashboardLayout
         title="Manage Users"
         description="View and manage all user accounts in the system"
         onRefresh={refetch}
         filters={AddUserButton}
      >
         <UserTable
            users={users}
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
