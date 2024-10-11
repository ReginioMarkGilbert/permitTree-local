import React, { useState, useCallback } from 'react';
import useUsers from './hooks/useUsers';
import UserTable from './components/UserTable';
import SA_UserDetailsViewModal from './components/SA_userDetailsViewModal';
import SA_UserEditDetailsModal from './components/SA_userEditDetailsModal';

const SuperAdminManageUsersPage = () => {
  const { users, loading, error, updateUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-3xl font-bold mb-6 text-green-800">Manage Users</h1>
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
    </div>
  );
};

export default SuperAdminManageUsersPage;
