import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USERS, ADD_USER, UPDATE_USER, DEACTIVATE_USER, ACTIVATE_USER } from './superAdmin';
import { toast } from 'sonner';

const useUsers = () => {
   const { data, loading, error, refetch } = useQuery(GET_ALL_USERS);

   const [addUserMutation] = useMutation(ADD_USER);
   const [updateUserMutation] = useMutation(UPDATE_USER);
   const [deactivateUserMutation] = useMutation(DEACTIVATE_USER);
   const [activateUserMutation] = useMutation(ACTIVATE_USER);

   const addUser = async (newUser) => {
      try {
         const { data } = await addUserMutation({
            variables: {
               firstName: newUser.firstName,
               lastName: newUser.lastName,
               username: newUser.username,
               password: newUser.password
            },
            refetchQueries: [{ query: GET_ALL_USERS }]
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

   return {
      users: data?.users || [],
      loading,
      error: error?.message,
      updateUser,
      addUser,
      deactivateUser,
      activateUser,
      refetch
   };
};

export default useUsers;
