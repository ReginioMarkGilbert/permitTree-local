import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/super/users', {
        headers: {
          Authorization: token
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId, updatedUser) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:3000/api/admin/super/users/${userId}`, updatedUser, {
        headers: {
          Authorization: token
        }
      });
      setUsers(users.map(user => (user._id === userId ? response.data : user)));
      return response.data;
    } catch (err) {
      setError('Failed to update user');
      throw err;
    }
  }, [users]);

  return { users, loading, error, fetchUsers, updateUser };
};

export default useUsers;
