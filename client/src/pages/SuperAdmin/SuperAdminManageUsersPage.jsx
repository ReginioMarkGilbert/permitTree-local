import React, { useState, useCallback } from 'react';
import useUsers from './hooks/useUsers';
import UserTable from './components/UserTable';
import SA_UserDetailsViewModal from './components/SA_userDetailsViewModal';
import SA_UserEditDetailsModal from './components/SA_userEditDetailsModal';
import SA_AddUserModal from './components/SA_AddUserModal';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
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
   const { users, loading, error, updateUser, addUser, deactivateUser, activateUser } = useUsers();
   const [selectedUser, setSelectedUser] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
   const [userToDeactivate, setUserToDeactivate] = useState(null);

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

   if (loading) return <div>Loading...</div>;
   if (error) return <div>Error: {error}</div>;

   return (
      <div className="min-h-screen bg-green-50">
         <div className="container mx-auto px-4 sm:px-6 py-24">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-green-800">Manage Users</h1>
               <Button onClick={() => setIsAddModalOpen(true)}>Add New User</Button>
            </div>
            <UserTable
               users={users}
               onViewUser={handleViewUser}
               onEditUser={handleEditUser}
               onDeactivateUser={handleDeactivateUser}
               onActivateUser={handleActivateUser}
            />
         </div>
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
      </div>
   );
};

export default SuperAdminManageUsersPage;
