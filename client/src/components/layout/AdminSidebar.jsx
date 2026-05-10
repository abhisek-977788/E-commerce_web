import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass-dark border-r border-white/10 z-40 pt-20 flex flex-col">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Admin Panel</p>
        
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === link.path
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 font-medium'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => dispatch(logout())}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Admin</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
