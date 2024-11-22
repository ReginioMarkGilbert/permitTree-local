import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import '../../../components/ui/styles/customScrollBar.css';

const UserTable = ({ users, onViewUser, onEditUser, onDeleteUser }) => {
   const getUserTypeColor = (userType) => {
      switch (userType) {
         case 'Personnel':
            return 'bg-purple-100 text-purple-800';
         case 'Client':
            return 'bg-yellow-100 text-yellow-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   return (
      <div className="bg-white rounded-lg shadow">
         <div className="overflow-x-auto">
            <div className="max-h-[680px] overflow-y-auto custom-scrollbar">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {users.map((user) => (
                        <tr key={user._id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ChiefRPS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                 {user.role}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeColor(user.userType)}`}>
                                 {user.userType}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                 <button
                                    className="text-green-600 hover:text-green-900"
                                    onClick={() => onViewUser(user)}
                                 >
                                    <Eye className="inline w-5 h-5" />
                                 </button>
                                 <button
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={() => onEditUser(user)}
                                 >
                                    <Edit className="inline w-5 h-5" />
                                 </button>
                                 <button
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => onDeleteUser(user)}
                                 >
                                    <Trash2 className="inline w-5 h-5" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default UserTable;
