import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, Filter, Shield, User, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-dark-950">
      <AdminSidebar />
      
      <div className="flex-1 ml-64 p-8 pt-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
            <p className="text-gray-400">Manage user accounts and roles.</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-10 w-full"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
            <button className="btn-secondary py-2 px-4 flex items-center gap-2 h-10">
              <Filter className="w-4 h-4" /> Filter Role
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium w-16">Avatar</th>
                  <th className="p-4 font-medium">Name & Email</th>
                  <th className="p-4 font-medium">Joined Date</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border bg-dark-900 cursor-pointer outline-none focus:ring-2 focus:ring-primary-500
                            ${user.role === 'admin' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 'bg-gray-500/10 text-gray-300 border-gray-500/20'}`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleDelete(user._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" disabled={user.role === 'admin'}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
