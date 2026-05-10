import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../../store/slices/orderSlice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, ShoppingBag, Package, Truck, Users } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <div className="pt-24 pb-20 page-container animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl"></div>)}
        </div>
        <div className="h-[400px] skeleton rounded-2xl"></div>
      </div>
    );
  }

  // Format data for chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = stats.monthlySales?.map(item => ({
    name: monthNames[item._id - 1],
    Revenue: item.revenue,
    Orders: item.orders
  })) || [];

  return (
    <div className="pt-24 pb-20 page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue?.toLocaleString('en-IN')}`} 
          icon={<IndianRupee className="w-6 h-6" />} 
          color="emerald" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag className="w-6 h-6" />} 
          color="primary" 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={<Package className="w-6 h-6" />} 
          color="warning" 
        />
        <StatCard 
          title="Delivered Orders" 
          value={stats.deliveredOrders} 
          icon={<Truck className="w-6 h-6" />} 
          color="success" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Revenue Analytics (Last 6 Months)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/admin/products')} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400"><ShoppingBag className="w-5 h-5"/></div>
                <span className="font-medium text-white">Add New Product</span>
              </div>
            </button>
            <button onClick={() => navigate('/admin/orders')} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning-500/20 text-warning-400"><Package className="w-5 h-5"/></div>
                <span className="font-medium text-white">Process Pending Orders</span>
              </div>
            </button>
            <button onClick={() => navigate('/admin/users')} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info-500/20 text-info-400"><Users className="w-5 h-5"/></div>
                <span className="font-medium text-white">Manage Users</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
