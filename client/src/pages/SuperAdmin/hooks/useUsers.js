import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useUsers = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const getAuthToken = () => {
      return localStorage.getItem('token');
   };

   const fetchUsers = useCallback(async () => {
      try {
         const token = getAuthToken();
         const response = await axios.get('http://localhost:3000/api/admin/super/users', {
            headers: { Authorization: token }
         });
         setUsers(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching users:', err);
         setError(err.response?.data?.message || 'Failed to fetch users');
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchUsers();
   }, [fetchUsers]);

   const updateUser = useCallback(async (userId, updatedUser) => {
      try {
         const token = getAuthToken();
         const response = await axios.put(`http://localhost:3000/api/admin/super/users/${userId}`, updatedUser, {
            headers: { Authorization: token }
         });
         setUsers(users.map(user => user._id === userId ? response.data : user));
      } catch (err) {
         throw new Error('Failed to update user');
      }
   }, [users]);

   const addUser = useCallback(async (newUser) => {
      try {
         const token = getAuthToken();
         const response = await axios.post('http://localhost:3000/api/admin/super/users', newUser, {
            headers: {
               Authorization: token,
               'Content-Type': 'application/json'
            }
         });

         const addedUser = response.data;
         setUsers(prevUsers => [...prevUsers, addedUser]);
         return addedUser;
      } catch (err) {
         console.error('Error adding user:', err.response?.data || err.message);
         throw new Error(err.response?.data?.message || 'Failed to add user');
      }
   }, []);

   return { users, loading, error, updateUser, addUser, setUsers };
};

export default useUsers;
