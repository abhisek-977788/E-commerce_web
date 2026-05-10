import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import { Search, Filter, Eye } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector(state => state.orders);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-warning-500/10 text-warning-400 border-warning-500/20';
      case 'confirmed': return 'bg-info-500/10 text-info-400 border-info-500/20';
      case 'shipped': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      case 'delivered': return 'bg-success-500/10 text-success-400 border-success-500/20';
      case 'cancelled': return 'bg-danger-500/10 text-danger-400 border-danger-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const filteredOrders = allOrders?.filter(o => 
    o._id.includes(searchTerm) || 
    o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex min-h-screen bg-dark-950">
      <AdminSidebar />
      
      <div className="flex-1 ml-64 p-8 pt-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
            <p className="text-gray-400">View and manage customer orders.</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="Search by Order ID or Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-10 w-full"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
            <button className="btn-secondary py-2 px-4 flex items-center gap-2 h-10">
              <Filter className="w-4 h-4" /> Filter Status
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders found.</td></tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white text-sm">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="p-4">
                        <p className="text-sm text-white">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-white text-sm">₹{order.totalPrice?.toLocaleString()}</td>
                      <td className="p-4">
                        <select 
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border bg-dark-900 ${getStatusColor(order.orderStatus)} cursor-pointer outline-none focus:ring-2 focus:ring-primary-500`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
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

export default AdminOrders;
