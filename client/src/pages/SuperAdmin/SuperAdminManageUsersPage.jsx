import React, { useState, useCallback } from 'react';
import useUsers from './hooks/useUsers';
import UserTable from './components/UserTable';
import SA_UserDetailsViewModal from './components/SA_userDetailsViewModal';
import SA_UserEditDetailsModal from './components/SA_userEditDetailsModal';
import SA_AddUserModal from './components/SA_AddUserModal';  // Make sure this import is correct
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast'; // Make sure you have this package installed

const SuperAdminManageUsersPage = () => {
  const { users, loading, error, updateUser, addUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleViewUser = useCallback((user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user) => {
    // Implement delete functionality
    console.log('Delete user:', user);
  }, []);

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
      toast.success('User added successfully');
    } catch (err) {
      console.error('Failed to add user:', err);
      toast.error(err.message || 'Failed to add user');
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
    </div>
  );
};

export default SuperAdminManageUsersPage;
