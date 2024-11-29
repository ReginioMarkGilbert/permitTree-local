import React from 'react';
import { Eye, Edit, Ban, Power } from 'lucide-react';
import '@/components/ui/styles/customScrollBar.css';
import { Badge } from "@/components/ui/badge";

const UserTable = ({ users, onViewUser, onEditUser, onDeactivateUser, onActivateUser }) => {
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
      <div className="flex flex-col">
         <div className="overflow-x-auto">
            <div className="align-middle inline-block min-w-full">
               <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                           <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 <Badge variant={user.isActive ? "success" : "destructive"}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                 <div className="flex gap-2">
                                    <button
                                       className="text-blue-600 hover:text-blue-900"
                                       onClick={() => onViewUser(user)}
                                    >
                                       <Eye className="inline w-5 h-5" />
                                    </button>
                                    <button
                                       className="text-yellow-600 hover:text-yellow-900"
                                       onClick={() => onEditUser(user)}
                                    >
                                       <Edit className="inline w-5 h-5" />
                                    </button>
                                    {user.isActive ? (
                                       <button
                                          className="text-red-600 hover:text-red-900"
                                          onClick={() => onDeactivateUser(user)}
                                       >
                                          <Ban className="inline w-5 h-5" />
                                       </button>
                                    ) : (
                                       <button
                                          className="text-green-600 hover:text-green-900"
                                          onClick={() => onActivateUser(user)}
                                       >
                                          <Power className="inline w-5 h-5" />
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
};

export default UserTable;
