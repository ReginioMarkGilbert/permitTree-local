import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2 } from 'lucide-react';
import SA_UserDetailsViewModal from './components/SA_userDetailsViewModal';
import SA_UserEditDetailsModal from './components/SA_userEditDetailsModal';

const SuperAdminManageUsersPage = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedUser, setSelectedUser] = useState(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await axios.get('http://localhost:3000/api/admin/super/users');
			setUsers(response.data);
			setLoading(false);
		} catch (err) {
			setError('Failed to fetch users');
			setLoading(false);
		}
	};

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

	const handleViewUser = (user) => {
		setSelectedUser(user);
		setIsViewModalOpen(true);
	};

	const handleEditUser = (user) => {
		setSelectedUser(user);
		setIsEditModalOpen(true);
	};

	const handleSaveUser = async (updatedUser) => {
		try {
			const response = await axios.put(`http://localhost:3000/api/admin/super/users/${selectedUser._id}`, updatedUser);
			setUsers(users.map(user => (user._id === selectedUser._id ? response.data : user)));
			setIsEditModalOpen(false);
			setSelectedUser(null);
		} catch (err) {
            console.log(err);
			setError('Failed to update user');
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	return (
		<div className="min-h-screen bg-green-50">
			<div className="container mx-auto px-4 sm:px-6 py-24">
				<h1 className="text-3xl font-bold mb-6 text-green-800">Manage Users</h1>
				<div className="bg-white rounded-lg shadow overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
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
												onClick={() => handleViewUser(user)}
											>
												<Eye className="inline w-5 h-5" />
											</button>
											<button
												className="text-blue-600 hover:text-blue-900"
												onClick={() => handleEditUser(user)}
											>
												<Edit className="inline w-5 h-5" />
											</button>
											<button className="text-red-600 hover:text-red-900">
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
