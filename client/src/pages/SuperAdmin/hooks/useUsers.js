import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USERS, ADD_USER, UPDATE_USER, DEACTIVATE_USER, ACTIVATE_USER, DELETE_USER } from './superAdmin';
import { toast } from 'sonner';

const useUsers = () => {
   const { data, loading, error, refetch } = useQuery(GET_ALL_USERS, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
   });

   const [addUserMutation] = useMutation(ADD_USER);
   const [updateUserMutation] = useMutation(UPDATE_USER);
   const [deactivateUserMutation] = useMutation(DEACTIVATE_USER);
   const [activateUserMutation] = useMutation(ACTIVATE_USER);
   const [deleteUserMutation] = useMutation(DELETE_USER);

   const addUser = async (newUser) => {
      try {
         const { data } = await addUserMutation({
            variables: {
               firstName: newUser.firstName,
               lastName: newUser.lastName,
               username: newUser.username,
               password: newUser.password,
               email: newUser.email,
               role: newUser.role,
               userType: newUser.userType
            },
            update: (cache, { data: { registerUser } }) => {
               // Read existing users from cache
               const existingUsers = cache.readQuery({
                  query: GET_ALL_USERS
               });

               // Prepare the new user object with all possible fields
               const newUserForCache = {
                  ...registerUser.user,
                  phone: null,
                  company: null,
                  address: null,
                  lastLoginDate: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               };

               // Write back to cache with new user added
               if (existingUsers) {
                  cache.writeQuery({
                     query: GET_ALL_USERS,
                     data: {
                        users: [...existingUsers.users, newUserForCache]
                     }
                  });
               }
            }
         });

         toast.success('User added successfully');
         return data.registerUser.user;
      } catch (err) {
         toast.error('Failed to add user', {
            description: err.message
         });
         throw err;
      }
   };

   const updateUser = async (userId, updatedUser) => {
      try {
         const { data } = await updateUserMutation({
            variables: {
               id: userId,
               input: {
                  firstName: updatedUser.firstName,
                  lastName: updatedUser.lastName,
                  email: updatedUser.email,
                  phone: updatedUser.phone,
                  company: updatedUser.company,
                  address: updatedUser.address
               }
            },
            refetchQueries: [{ query: GET_ALL_USERS }]
         });

         toast.success('User updated successfully');
         return data.updateUserProfile;
      } catch (err) {
         toast.error('Failed to update user', {
            description: err.message
         });
         throw err;
      }
   };

   const deactivateUser = async (userId) => {
      try {
         await deactivateUserMutation({
            variables: { id: userId },
            refetchQueries: [{ query: GET_ALL_USERS }]
         });

         toast.success('User deactivated successfully');
         return true;
      } catch (err) {
         toast.error('Failed to deactivate user', {
            description: err.message
         });
         throw err;
      }
   };

   const activateUser = async (userId) => {
      try {
         await activateUserMutation({
            variables: { id: userId },
            refetchQueries: [{ query: GET_ALL_USERS }]
         });

         toast.success('User activated successfully');
         return true;
      } catch (err) {
         toast.error('Failed to activate user', {
            description: err.message
         });
         throw err;
      }
   };

   const deleteUser = async (userId) => {
      try {
         await deleteUserMutation({
            variables: { id: userId },
            refetchQueries: [{ query: GET_ALL_USERS }]
         });

         toast.success('User deleted successfully');
         return true;
      } catch (err) {
         toast.error('Failed to delete user', {
            description: err.message
         });
         throw err;
      }
   };

   const handleRefetch = useCallback(async () => {
      try {
         await refetch();
      } catch (error) {
         console.error('Error refetching users:', error);
      }
   }, [refetch]);

   return {
      users: data?.users || [],
      loading,
      error: error?.message,
      updateUser,
      addUser,
      deactivateUser,
      activateUser,
      deleteUser,
      refetch: handleRefetch
   };
};

export default useUsers;
