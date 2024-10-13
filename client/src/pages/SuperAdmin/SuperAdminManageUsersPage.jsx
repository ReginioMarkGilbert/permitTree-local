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
   const { users, loading, error, updateUser, addUser, deleteUser } = useUsers();
   const [selectedUser, setSelectedUser] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

   const handleDeleteUser = useCallback((user) => {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
   }, []);

   const confirmDelete = useCallback(async () => {
      if (userToDelete) {
         try {
            await deleteUser(userToDelete._id);
            toast.success('User deleted successfully');
         } catch (err) {
            console.error('Failed to delete user:', err);
            toast.error('Failed to delete user', {
              description: err.message || 'An error occurred while deleting the user.'
            });
         } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
         }
      }
   }, [deleteUser, userToDelete]);

   const handleSaveUser = useCallback(async (updatedUser) => {
      try {
         await updateUser(selectedUser._id, updatedUser);
         setIsEditModalOpen(false);
         setSelectedUser(null);
      } catch (err) {
         console.error('Failed to update user:', err);
      }
   }, [selectedUser, updateUser]);

   const handleAddUser = useCallback(async (newUser) => {
      try {
         const addedUser = await addUser(newUser);
         setIsAddModalOpen(false);
         toast.success('User added successfully', {
           description: `${addedUser.firstName} ${addedUser.lastName} has been added.`
         });
      } catch (err) {
         console.error('Failed to add user:', err);
         toast.error('Failed to add user', {
           description: err.message || 'An error occurred while adding the user.'
         });
      }
   }, [addUser]);

   if (loading) return <div>Loading...</div>;
   if (error) return <div>{error}</div>;

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
               onDeleteUser={handleDeleteUser}
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
         <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This action cannot be undone. This will permanently delete the user
                     account and remove their data from our servers.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
};

export default SuperAdminManageUsersPage;
