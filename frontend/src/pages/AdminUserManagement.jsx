import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '../redux/userApiSlice';
import { Shield, ShieldAlert, User, ChefHat, Search, ArrowLeft, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUserManagement() {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRole({ id: userId, role: newRole }).unwrap();
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'STAFF': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'KITCHEN': return <ChefHat className="w-5 h-5 text-orange-500" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div></div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/admin"
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-orange-500 hover:border-orange-200 transition shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User & Role Management</h1>
              <p className="text-gray-500 font-medium text-sm">Assign Staff, Kitchen, Admin or Customer permissions</p>
            </div>
          </div>

          <Link
            to="/dashboard/admin/menu"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-orange-600 px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
          >
            <Utensils className="h-4 w-4 text-orange-500" />
            Go to Menu Manager
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
            <h2 className="text-xl font-bold text-gray-900">All Registered Users</h2>
            
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-orange-500 focus:border-orange-500 bg-gray-50 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Joined</th>
                  <th className="p-4 font-bold">Current Role</th>
                  <th className="p-4 font-bold text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-bold text-gray-700">{user.role}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={isUpdating}
                        className="bg-gray-100 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-orange-500 font-medium cursor-pointer"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="STAFF">STAFF</option>
                        <option value="KITCHEN">KITCHEN STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
