import React, { useState, useCallback, useMemo } from 'react';
import useUsers from './hooks/useUsers';
import UserTable from './components/UserTable';
import SA_UserDetailsViewModal from './components/SA_userDetailsViewModal';
import SA_UserEditDetailsModal from './components/SA_userEditDetailsModal';
import SA_AddUserModal from './components/SA_AddUserModal';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/layouts/DashboardLayout';
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { format } from "date-fns";
import {
   Pagination,
   PaginationContent,
   PaginationEllipsis,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from "@/components/ui/pagination";

const ROLES = {
   ALL_ROLES: 'All Roles',
   Chief_RPS: 'Chief RPS',
   superadmin: 'Super Admin',
   Technical_Staff: 'Technical Staff',
   Chief_TSD: 'Chief TSD',
   Receiving_Clerk: 'Receiving Clerk',
   Releasing_Clerk: 'Releasing Clerk',
   Accountant: 'Accountant',
   OOP_Staff_Incharge: 'OOP Staff Incharge',
   Bill_Collector: 'Bill Collector',
   Credit_Officer: 'Credit Officer',
   PENR_CENR_Officer: 'PENR/CENR Officer',
   Deputy_CENR_Officer: 'Deputy CENR Officer',
   Inspection_Team: 'Inspection Team'
};

const SuperAdminManageUsersPage = () => {
   const { users, loading, error, updateUser, addUser, deactivateUser, activateUser, deleteUser, refetch } = useUsers();
   const [selectedUser, setSelectedUser] = useState(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
   const [userToDeactivate, setUserToDeactivate] = useState(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [userToDelete, setUserToDelete] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [dateRange, setDateRange] = useState({ from: null, to: null });
   const [selectedRole, setSelectedRole] = useState('ALL_ROLES');
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   const handleViewUser = useCallback((user) => {
      setSelectedUser(user);
      setIsViewModalOpen(true);
   }, []);

   const handleEditUser = useCallback((user) => {
      setSelectedUser(user);
      setIsEditModalOpen(true);
   }, []);

   const handleDeactivateUser = useCallback((user) => {
      setUserToDeactivate(user);
      setIsDeactivateModalOpen(true);
   }, []);

   const handleActivateUser = useCallback(async (user) => {
      try {
         await activateUser(user.id);
      } catch (err) {
         console.error('Failed to activate user:', err);
      }
   }, [activateUser]);

   const confirmDeactivate = useCallback(async () => {
      if (userToDeactivate) {
         try {
            await deactivateUser(userToDeactivate.id);
            setIsDeactivateModalOpen(false);
            setUserToDeactivate(null);
         } catch (err) {
            console.error('Failed to deactivate user:', err);
         }
      }
   }, [deactivateUser, userToDeactivate]);

   const handleSaveUser = useCallback(async (updatedUserData) => {
      try {
         await updateUser(selectedUser.id, updatedUserData);
         setIsEditModalOpen(false);
         setSelectedUser(null);
      } catch (err) {
         console.error('Failed to update user:', err);
      }
   }, [selectedUser, updateUser]);

   const handleAddUser = useCallback(async (newUserData) => {
      try {
         await addUser(newUserData);
         await refetch();
         setIsAddModalOpen(false);
      } catch (err) {
         console.error('Failed to add user:', err);
         throw err;
      }
   }, [addUser, refetch]);

   const handleDeleteUser = useCallback((user) => {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
   }, []);

   const confirmDelete = useCallback(async () => {
      if (userToDelete) {
         try {
            await deleteUser(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
         } catch (err) {
            console.error('Failed to delete user:', err);
         }
      }
   }, [deleteUser, userToDelete]);

   const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
   };

   const paginatedUsers = useMemo(() => {
      const filtered = users?.filter(user => {
         const matchesSearch = (
            user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase())
         );

         const matchesRole = selectedRole === 'ALL_ROLES' || user.roles?.includes(selectedRole);

         const matchesDate = (!dateRange.from || !dateRange.to) ? true :
            new Date(user.createdAt) >= dateRange.from &&
            new Date(user.createdAt) <= dateRange.to;

         return matchesSearch && matchesRole && matchesDate;
      }) || [];

      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      return {
         users: filtered.slice(startIndex, endIndex),
         totalPages,
         total: filtered.length
      };
   }, [users, searchQuery, selectedRole, dateRange, currentPage]);

   const handleClearFilters = () => {
      setSearchQuery('');
      setDateRange({ from: null, to: null });
      setSelectedRole('ALL_ROLES');
      setCurrentPage(1);
   };

   const filteredUsers = users?.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === 'ALL_ROLES' || user.role === selectedRole;

      const matchesDate = (!dateRange.from || !dateRange.to) ? true :
         new Date(user.createdAt) >= dateRange.from &&
         new Date(user.createdAt) <= dateRange.to;

      return matchesSearch && matchesRole && matchesDate;
   });

   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const DateRangeComponent = () => {
      if (isChrome) {
         return (
            <div className="flex items-center space-x-2">
               <div className="flex items-center rounded-md border border-input">
                  <input
                     type="date"
                     value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                     onChange={(e) => {
                        const from = e.target.value ? new Date(e.target.value) : null;
                        setDateRange(prev => ({ ...prev, from }));
                     }}
                     className="h-10 px-3 py-2 rounded-md bg-background text-sm focus:outline-none"
                  />
               </div>
               <span className="text-sm text-muted-foreground">to</span>
               <div className="flex items-center rounded-md border border-input">
                  <input
                     type="date"
                     value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                     onChange={(e) => {
                        const to = e.target.value ? new Date(e.target.value) : null;
                        setDateRange(prev => ({ ...prev, to }));
                     }}
                     className="h-10 px-3 py-2 rounded-md bg-background text-sm focus:outline-none"
                  />
               </div>
            </div>
         );
      }

      return (
         <div className="min-w-[240px]">
            <DateRangePicker
               value={dateRange}
               onChange={setDateRange}
            />
         </div>
      );
   };

   const SelectComponent = () => {
      if (isChrome) {
         return (
            <select
               value={selectedRole}
               onChange={(e) => setSelectedRole(e.target.value)}
               className="w-[220px] h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
               {Object.entries(ROLES).map(([value, label]) => (
                  <option key={value} value={value}>
                     {label}
                  </option>
               ))}
            </select>
         );
      }

      return (
         <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[220px]">
               <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
               {Object.entries(ROLES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                     {label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   const FiltersSection = (
      <div className="flex flex-col gap-4 sm:flex-row items-end mb-6">
         <div className="flex-1 min-w-[200px] relative">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
               />
            </div>
         </div>
         <DateRangeComponent />
         <SelectComponent />
         <Button
            variant="outline"
            onClick={handleClearFilters}
            className="whitespace-nowrap"
         >
            Clear Filters
         </Button>
         <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">Add New User</Button>
      </div>
   );

   if (loading) return <div>Loading...</div>;
   if (error) return <div>Error: {error}</div>;

   return (
      <DashboardLayout
         title="Manage Users"
         description="View and manage all user accounts in the system"
         onRefresh={refetch}
         filters={FiltersSection}
      >
         <div className="space-y-4">
            <UserTable
               users={paginatedUsers.users}
               onViewUser={handleViewUser}
               onEditUser={handleEditUser}
               onDeactivateUser={handleDeactivateUser}
               onActivateUser={handleActivateUser}
               onDeleteUser={handleDeleteUser}
            />

            {paginatedUsers.totalPages > 1 && (
               <div className="flex justify-center py-4 border-t">
                  <Pagination>
                     <PaginationContent>
                        <PaginationItem>
                           <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                           />
                        </PaginationItem>

                        {[...Array(paginatedUsers.totalPages)].map((_, i) => {
                           const pageNumber = i + 1;
                           if (
                              pageNumber === 1 ||
                              pageNumber === paginatedUsers.totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                           ) {
                              return (
                                 <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                       onClick={() => handlePageChange(pageNumber)}
                                       isActive={currentPage === pageNumber}
                                    >
                                       {pageNumber}
                                    </PaginationLink>
                                 </PaginationItem>
                              );
                           } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                           ) {
                              return (
                                 <PaginationItem key={pageNumber}>
                                    <PaginationEllipsis />
                                 </PaginationItem>
                              );
                           }
                           return null;
                        })}

                        <PaginationItem>
                           <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === paginatedUsers.totalPages}
                           />
                        </PaginationItem>
                     </PaginationContent>
                  </Pagination>
               </div>
            )}
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
         <AlertDialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This will deactivate the user account. The user will no longer be able to log in.
                     This action can be reversed by reactivating the account later.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeactivateModalOpen(false)}>
                     Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeactivate}>
                     Deactivate
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
         <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete this user account? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
                     Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </DashboardLayout>
   );
};

export default SuperAdminManageUsersPage;
