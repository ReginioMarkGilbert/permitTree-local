import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';

const AuthContext = createContext(null);

// Query to get the current user
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      username
      firstName
      lastName
      roles
      email
    }
  }
`;

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   const { data, error } = useQuery(GET_CURRENT_USER, {
      fetchPolicy: 'network-only'
   });

   useEffect(() => {
      if (data?.getCurrentUser) {
         console.log('User data from query:', data.getCurrentUser);
         setUser({
            id: data.getCurrentUser.id,
            username: data.getCurrentUser.username,
            firstName: data.getCurrentUser.firstName,
            lastName: data.getCurrentUser.lastName,
            roles: data.getCurrentUser.roles,
            email: data.getCurrentUser.email
         });
      }
      setLoading(false);
   }, [data]);

   const value = {
      user,
      setUser,
      loading,
      error
   };

   if (loading) {
      return <div>Loading...</div>; // Or your loading component
   }

   return (
      <AuthContext.Provider value={value}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (context === null) {
      throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
};
